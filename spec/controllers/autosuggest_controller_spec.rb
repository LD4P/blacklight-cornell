require 'spec_helper'

#  url : "/search_ac?term=" + $('#q').val(),
describe AutosuggestController do

  let(:controller) { described_class.new }

  describe "get_suggestions ajax call", :type => :controller do
    context "autosuggest variations based on query term" do

      context "respond_to where the query term is 'rosamond smith'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=rosamond+smith"}
        let :results do
          controller.get_solr_response uri
        end
        before(:each) do
          allow(controller).to receive(:params).and_return('term' => "rosamond smith")
            get 'get_suggestions', :format => :json
            stub_request(:get, uri)
              .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_rosamond_smith.json').read)
        end
        
        it "returns a json response for the query term 'rosamond smith'" do
            body = JSON.parse(response.body)
            expect(body[0]).to eq "Authors"
            expect(body[1]["value"]).to eq "Smith, Rosamond, 1938-"
            expect(body[1]["uri"]).to eq "http://id.loc.gov/authorities/names/n86129758"
            expect(body[2]["value"]).to eq "Oates, Joyce Carol, 1938-"
            expect(body[2]["uri"]).to eq "http://id.loc.gov/authorities/names/n78095538"
        end
      end
      
      context "respond_to where the query term is 'roderick jaynes'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=roderick+jaynes"}
        let :results do
          controller.get_solr_response uri
        end
        before(:each) do
          allow(controller).to receive(:params).and_return('term' => "roderick jaynes")
            get 'get_suggestions', :format => :json
            stub_request(:get, uri)
              .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_roderick_jaynes.json').read)
        end
        
        it "returns a json response for the query term 'roderick jaynes'" do
            body = JSON.parse(response.body)
            expect(body[0]).to eq "Authors"
            expect(body[1]["value"]).to eq "Jaynes, Roderick"
            expect(body[1]["uri"]).to eq "http://id.loc.gov/authorities/names/no2001068250"
            expect(body[2]["value"]).to eq "Coen, Joel"
            expect(body[2]["uri"]).to eq "http://id.loc.gov/authorities/names/n87871864"
            expect(body[3]["value"]).to eq "Coen, Ethan"
            expect(body[3]["uri"]).to eq "http://id.loc.gov/authorities/names/n87871865"
        end
      end
      
      context "respond_to where the query term is 'samuel langhorne'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=samuel+langhorne"}
        let :results do
          controller.get_solr_response uri
        end
        before(:each) do
          allow(controller).to receive(:params).and_return('term' => "samuel langhorne")
            get 'get_suggestions', :format => :json
            stub_request(:get, uri)
              .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_samuel_langhorne.json').read)
        end
        
        it "returns a json response for the query term 'samuel langhorne'" do
            body = JSON.parse(response.body)
            expect(body[0]).to eq "Authors"
            expect(body[1]["value"]).to eq "Clemens, Samuel Langhorne, 1835-1910"
            expect(body[1]["uri"]).to eq "http://id.loc.gov/authorities/names/n93099439"
            expect(body[2]["value"]).to eq "Twain, Mark, 1835-1910"
            expect(body[2]["uri"]).to eq "http://id.loc.gov/authorities/names/n79021164"
        end
      end
      
      context "respond_to where the query term is 'free jazz'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=free+jazz"}
        let :results do
          controller.get_solr_response uri
        end
        before(:each) do
          allow(controller).to receive(:params).and_return('term' => "free jazz")
            get 'get_suggestions', :format => :json
            stub_request(:get, uri)
              .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_free_jazz.json').read)
        end
        
        it "returns a json response for the query term 'free jazz'" do
            body = JSON.parse(response.body)
            expect(body[0]).to eq "Genres"
            expect(body[1]["value"]).to eq "Free jazz"
            expect(body[1]["uri"]).to eq "http://id.loc.gov/authorities/genreForms/gf2014026816"
            expect(body[2]).to eq "Subjects"
            expect(body[3]["uri"]).to eq "http://id.worldcat.org/fast/933892"
        end
      end
      
      context "respond_to where the query term is 'pearl harbor'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=pearl+harbor"}
        let :results do
          controller.get_solr_response uri
        end
        before(:each) do
          allow(controller).to receive(:params).and_return('term' => "pearl harbor")
            get 'get_suggestions', :format => :json
            stub_request(:get, uri)
              .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_pearl_harbor.json').read)
        end
        
        it "returns a json response for the query term 'pearl harbor'" do
            body = JSON.parse(response.body)
            expect(body[0]).to eq "Locations"
            expect(body[1]["value"]).to eq "Hawaii > Pearl Harbor"
            expect(body[1]["uri"]).to eq "http://id.worldcat.org/fast/1244025"
            expect(body[2]["value"]).to eq "Hawaii > Pearl Harbor National Wildlife Refuge"
            expect(body[3]).to eq "Subjects"
            expect(body[4]["uri"]).to eq "http://id.worldcat.org/fast/1056083"
        end
      end
      
    end    
  end

end
