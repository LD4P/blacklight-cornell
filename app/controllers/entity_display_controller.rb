class EntityDisplayController < ApplicationController
  require 'net/http'

  def display
    require "net/http"
    # Query parameter
    @uri = params[:uri]
  end
  
  def index
  end
end