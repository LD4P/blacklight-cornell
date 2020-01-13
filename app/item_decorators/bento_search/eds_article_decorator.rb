module BentoSearch
  class EdsArticleDecorator < StandardDecorator

    def render_source_info

save_level = Rails.logger.level; Rails.logger.level = Logger::WARN
Rails.logger.warn "jgr25_log #{__FILE__} #{__LINE__}: in EdsArticleDecorator render_source_info"
puts self.to_yaml
Rails.logger.level = save_level

      parts = []

      if self.source_title.present?
        parts << _h.content_tag("span", self.source_title, :class => "source_title")
        parts << ". "
      elsif self.publisher.present?
        parts << _h.content_tag("span", self.publisher, :class => "publisher")
        parts << ". "
      end

      if text = self.render_citation_details
        parts << text << "."
      end

      return _h.safe_join(parts, "")
    end
    # A summary. If config.for_dispaly.prefer_snippets_as_summary is set to true
    # then prefers that, otherwise abstract.
    #
    # Truncates for display.
    def render_summary
      summary = nil

    end

  def render_citation_details
    save_level = Rails.logger.level; Rails.logger.level = Logger::WARN
    Rails.logger.warn "jgr25_log #{__FILE__} #{__LINE__}: in EdsArticleDecorator render_citation_details"
    puts 'custom_data: ' + self.custom_data.to_yaml
    Rails.logger.level = save_level
    result_elements = []
    result_elements.push  self.custom_data[:citation_blob]

    return nil if result_elements.empty?

    return result_elements.join(", ").html_safe
  end

end
end
