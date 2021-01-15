class InstitutionalRepositoriesController < ApplicationController

  before_action :heading

  def heading
    @heading='Search'
  end

  def index
  	view = params["view"] || "index"
    @query = params["q"].nil? ? '' : params["q"]
    @oq = @query
    @page = params["page"].nil? ?  1 : params["page"]
    #Allowing parameter for rows
    @per_page = params["per_page"] || 10
    # Adding subject field specifically
    @search_field = params["search_field"].nil? ? '': params["search_field"]
    @results = BentoSearch.get_engine(:institutionalRepositories).search(@query, :oq => @oq,
      :per_page => @per_page, :page => @page, :search_field => @search_field)
    render view
  end
  

end
