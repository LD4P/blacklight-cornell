class BackendController < ApplicationController
  L2L = 'l2l'
  BD = 'bd'
  HOLD = 'hold'
  RECALL = 'recall'
  PURCHASE = 'purchase'
  ILL = 'ill'
  ASK = 'ask'

  def holdings
    #@holdings = JSON.parse(HTTPClient.get_content("http://es287-dev.library.cornell.edu:8950/holdings/retrieve/#{params[:id]}"))[params[:id]]
    @holdings = JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"))[params[:id]]
    @holdings_detail = JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve_detail_raw/#{params[:id]}"))[params[:id]]
    #@holdings = JSON.parse(HTTPClient.get_content("http://es287-dev.library.cornell.edu:8950/holdings/fetch/#{params[:id]}"))[params[:id]]
    #@holdings = JSON.parse(HTTPClient.get_content("http://rossini.cul.columbia.edu/voyager_backend/holdings/retrieve/#{params[:id]}"))[params[:id]]
    @id = params[:id]
    logger.debug  "getting info for #{params[:id]} from" 
    logger.debug Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"
    logger.debug @holdings 
    logger.debug session.inspect
    session[:holdings] = @holdings
    session[:holdings_detail] = @holdings_detail
    logger.debug session.inspect
    #render :text => @txt.to_s  + @t.to_s
    render "backend/holdings", :layout => false
  end

  def holdings_short
    @holdings = JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"))[params[:id]]
    @holdings_detail = JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve_detail_short/#{params[:id]}"))[params[:id]]
    @id = params[:id]
    logger.debug  "getting info for #{params[:id]} from" 
    logger.debug Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"
    logger.debug @holdings 
    logger.debug session.inspect
    session[:holdings] = @holdings
    session[:holdings_detail] = @holdings_detail
    logger.debug session.inspect
    render :json => @holdings_detail  
    #render "backend/holdings", :layout => false
  end

  def holdings_shorth
    @holdings = JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"))[params[:id]]
    @holdings_detail = JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve_detail_short/#{params[:id]}"))[params[:id]]
    @id = params[:id]
    logger.debug  "getting info for #{params[:id]} from" 
    logger.debug Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"
    logger.debug @holdings 
    logger.debug session.inspect
    session[:holdings] = @holdings
    session[:holdings_detail] = @holdings_detail
    logger.debug session.inspect
    #render :json => @holdings_detail  
    render "backend/holdings_short", :layout => false
  end

  def holdings_mail

    @holdings = JSON.parse(HTTPClient.get_content("http://rossini.cul.columbia.edu/voyager_backend/holdings/retrieve/#{params[:id]}"))[params[:id]]
    @id = params[:id]

    render "backend/_holdings_mail", :layout => false
  end

  def feedback_mail
    session[:feedback_form_name] = params["name"]
    session[:feedback_form_email] = params["email"]
    begin
      FeedbackNotifier.send_feedback(params).deliver
  
      render :text => "success"
    rescue Exception => e
      logger.info e.backtrace
      render :text => "failure"
    end
  end

  def retrieve_book_jackets
    isbns = params["isbns"].listify
    results = {}
    hc = HTTPClient.new

    begin
      isbns.each do |isbn|
        unless results[isbn]
          query_url = 'http://books.google.com/books/feeds/volumes'
          logger.info("retrieving #{query_url}?q=isbn:#{isbn}")
          xml = Nokogiri::XML(hc.get_content(query_url, :q => "isbn:" + isbn))
          image_node = xml.at_css("feed>entry>link[@type^='image']")
          results[isbn] = image_node.attributes["href"].content.gsub(/zoom=./,"zoom=1") if image_node
        end
      end
    rescue Exception => e
      logger.warn("exception retrieving google book search: #{e.message}")
    end
    
    render :json => results
  end

  def get_status item
    #item.keys.any? { |s| s.to_s.include?('Checked out') } && (items['status'] != 'available' && items['status'] != 'some_available')
    ## Available
    ## Chaged
    ## Missing/lost
    'Available' 
  end

  def get_item_availability holdings
    availability = 'not availiable'
    holdings['condensed_holdings_full'].each do |location|
      if (location['status'] == 'available' || location['status'] == 'some_available') && location['location_name'].exclude?('(Non-Circulating)')
        logger.debug location['location_name']
        availability = 'available'
        break
      end
    end
    availability
  end

  def get_barcode_from_netid netid
    user_info = JSON.parse(HTTPClient.get_content("http://catalog.library.cornell.edu/cgi-bin/netid7.cgi?netid=#{netid}"))
    user_info['bc']
  end

  def get_borrow_direct_availability patron_barcode, isbn, title=nil
    if isbn != nil
      HTTPClient.get_content("https://borrow-direct.relaisd2d.com/service-proxy/?command=mkauth&LS=CORNELL&PI=#{patron_barcode}&query=isbn%3D#{isbn}")
    elsif title != nil
      HTTPClient.get_content("https://borrow-direct.relaisd2d.com/service-proxy/?command=mkauth&LS=CORNELL&PI=#{patron_barcode}&query=ti%3D#{title}")
    else
    end
  end

  # Authenticate and bind to Cornell's Active Directory LDAP service
  # Returns an ldap object that can be used for searches (or nil on failure)
  def bind_ldap

    # Login credentials (provided by Desktop Services)
    holding_id_dn = 'CN=LIB-BlacklightDev-hid,OU=DS support areas,OU=HoldingIDs,OU=IDs,OU=LIBRARY,OU=DelegatedObjects,DC=cornell,DC=edu'
    holding_pw = 'callufr@x13'

    # Set up LDAP connection
    ldap = Net::LDAP.new
    ldap.host = 'query.ad.cornell.edu'
    ldap.port = 389
    ldap.auth holding_id_dn, holding_pw

    if ldap.bind
      return ldap
    else
      return nil
    end
  end

  # Return our requests-specific patron type by looking at
  # the LDAP entry's reference groups.
  # Our basic assumption: a person is student/faculty/staff if he/she belongs to
  #  one of the following reference groups:
  #    rg.cuniv.employee, rg.cuniv.student
  # Reference Groups reference page is http://www.it.cornell.edu/services/group/about/reference.cfm
  def get_patron_type netid

    unless netid.nil?
      patron_dn = get_ldap_dn netid
      return nil if patron_dn.nil?

      ldap = bind_ldap
      return unless ldap

      # Do our search
      search_params = { :base =>   patron_dn, 
                        :scope =>  Net::LDAP::SearchScope_BaseObject,
                        :attrs =>  ['tokenGroups'] }
      ldap.search(search_params) do |entry|

        # This is a brute-force approach because I can't make sense of LDAP
        # Just match all the attributes of the form 'CN=rg.whatever'
        reference_groups = entry.to_ldif.scan(/CN=(rg.*?),/).flatten
        if reference_groups.include? "rg.cuniv.employee" or reference_groups.include? "rg.cuniv.student"
          return "cornell"
        else
          return "guest"
        end
      end

    end
  end

  # Return a user's distinguished name (dn) from an LDAP lookup
  # TODO: This function seems pontentially reusable. Figure out where to put it so that
  # more controllers (and models?) can access it
  # This is based heavily on sample Perl code from ss488, CIT, at 
  #    https://confluence.cornell.edu/download/attachments/118767666/tokengroups.pl
  def get_ldap_dn netid

    # Login credentials (provided by Desktop Services)
    holding_id_dn = 'CN=LIB-BlacklightDev-hid,OU=DS support areas,OU=HoldingIDs,OU=IDs,OU=LIBRARY,OU=DelegatedObjects,DC=cornell,DC=edu'
    holding_pw = 'callufr@x13'

    ldap = bind_ldap
    return unless ldap

    # Do our search
    search_params = { :base => 'DC=cornell,DC=edu', 
                      :filter => Net::LDAP::Filter.eq('sAMAccountName', netid), 
                      :attrs => ['distinguishedName'] }
    ldap.search(search_params) do |entry|
      return entry.dn
    end
  end

  def get_item_type holdings
    ## there are three types of loans
    ## regular
    ## day
    ## minute
    'regular'
  end

  def request_item
    service = _request_item params[:id], request.env['REMOTE_USER']
    @request_solution = service 
    #@request_solution = {:service => 'bd'}
    render "backend/request_item", :layout => false
  end

  def _request_item bibid, netid
    holdings = ( get_holdings bibid )[bibid]['condensed_holdings_full']
    item_type = get_item_type holdings
    netid = 'gid-silterrae'
    patron_type = get_patron_type netid
    @request_solution = ''
    l2l_list = []
    bd_list = []
    hold_list = []
    recall_list = []
    ill_list = []
    ask_list = []

    ## sk274 - not the most efficient way to handle this
    ##         TODO: optimize once we get all the functionality working
    holdings.each do |holding|
      logger.debug 'status: ' + holding['status']
      if holding['location_name'] == '*Networked Resource'
        next
      elsif holding['status'] == 'available' || holding['status'] == 'some_available'
        if item_type != 'minute'
          l2l_list.push( _handle_l2l bibid, holding, netid )
        else
          ask_list.push( _handle_ask bibid, holdings, netid )
        end
      elsif holding['status'] == 'not_available'
        if item_type == 'regular'
          if patron_type == 'cornell'
            bd_list.push( _handle_bd bibid, holdings, netid )
          else
            ## guest
            hold_list.push( _handle_hold bibid, holdings, netid )
          end
        elsif item_type == 'day'
          hold_list.push( _handle_hold bibid, holdings, netid )
        else
          ## minute
          ask_list.push( _handle_ask bibid, holdings, netid )
        end
      else
        ## missing?
        if patron_type == 'cornell'
          bd_list.push( _handle_bd bibid, holdings, netid )
        else
          ## guest
          ask_list.push( _handle_ask bibid, holdings, netid )
        end
      end
    end

    ## sk274 - online resource first?
    if l2l_list.present?
      return l2l_list.first
    elsif bd_list.present?
      return bd_list.first
    elsif hold_list.present?
      return hold_list.first
    elsif recall_list.present?
      return recall_list.first
    elsif ill_list.present?
      return ill_list.first
    elsif ask_list.present?
      return ask_list.first
    else
      ## what to do?
    end
  end

  def get_holdings bibid
    return JSON.parse(HTTPClient.get_content(Rails.configuration.voyager_holdings + "/holdings/retrieve/#{params[:id]}"))
  end

  def _handle_l2l bibid, holding, netid
    holding_index = 0
    holding['copies'].each do |copy|
      if copy['items']['Available']['status'] == 'available' || copy['items']['Available']['status'] == 'some_available'
        return {
          :holding_id => holding['holding_id'][holding_index],
          :service => L2L,
          :location => holding['location_name']
        }
      end
      holding_index = holding_index + 1
    end
  end

  def _handle_bd bibid, holdings, netid
    return { :service => BD }
  end

  def _handle_hold bibid, holdings, netid
    return { :service => HOLD }
  end

  def _handle_recall bibid, holdings, netid
    return { :service => RECALL }
  end

  def _handle_purchase bibid, holdings, netid
    return { :service => PURCHASE }
  end

  def _handle_ill bibid, holdings, netid
    return { :service => ILL }
  end

  def _handle_ask bibid, holdings, netid
    return { :service => ASK }
  end

end
