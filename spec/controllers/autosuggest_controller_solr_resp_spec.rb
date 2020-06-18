require 'spec_helper'

#  url : "/search_ac?term=" + $('#q').val(),
describe AutosuggestController do

  let(:controller) { described_class.new }

  describe "Routes", :type => :routing do
    it 'routes GET /search_ac to AutosuggestController#get_suggestions' do
      expect(get: '/search_ac').to route_to(controller: 'autosuggest', action: 'get_suggestions')
    end
  end

  describe "get_suggestions ajax call" do
    context "autosuggest variations based on query term" do

      context "solr response where the query term is 'rosamond smith'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=rosamond+smith"}
        let :results do
          controller.get_solr_response uri
        end
        before do
          stub_request(:get, uri)
            .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_rosamond_smith.json').read)
        end
        
        it "returns a solr response for the term 'rosamond smith'" do
          expect(results['response']["numFound"]).to eq 1
          expect(results['response']["docs"][0]["type_s"]).to eq "author"
          expect(results['response']["docs"][0]["label_s"]).to eq "Smith, Rosamond, 1938-"
          expect(eval(results['response']["docs"][0]["pseudonyms_ss"][0])[:label]).to eq "Oates, Joyce Carol, 1938-"
        end
      end
      
      context "solr response where the query term is 'roderick jaynes'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=roderick+jaynes"}
        let :results do
          controller.get_solr_response uri
        end
        before do
          stub_request(:get, uri)
            .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_roderick_jaynes.json').read)
        end
        
        it "returns a solr response for the term 'roderick jaynes'" do
          expect(results['response']["numFound"]).to eq 1
          expect(results['response']["docs"][0]["type_s"]).to eq "author"
          expect(results['response']["docs"][0]["label_s"]).to eq "Jaynes, Roderick"
          expect(results['response']["docs"][0]["wd_description_s"]).to eq "American filmmakers"
          expect(eval(results['response']["docs"][0]["pseudonyms_ss"][0])[:label]).to eq "Coen, Joel"
          expect(eval(results['response']["docs"][0]["pseudonyms_ss"][1])[:label]).to eq "Coen, Ethan"
        end
      end
      
      context "solr response where the query term is 'free jazz'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=free+jazz"}
        let :results do
          controller.get_solr_response uri
        end
        before do
          stub_request(:get, uri)
            .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_free_jazz.json').read)
        end
        
        it "returns a solr response for the term 'free jazz'" do
          expect(results['response']["numFound"]).to eq 2
          expect(results['response']["docs"][0]["type_s"]).to eq "subject"
          expect(results['response']["docs"][0]["label_s"]).to eq "Free jazz"
          expect(results['response']["docs"][1]["type_s"]).to eq "genre"
          expect(results['response']["docs"][1]["label_s"]).to eq "Free jazz"
        end
      end
      
      context "solr response where the query term is 'pearl harbor'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=pearl+harbor"}
        let :results do
          controller.get_solr_response uri
        end
        before do
          stub_request(:get, uri)
            .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_pearl_harbor.json').read)
        end
        
        it "returns a solr response for the term 'pearl harbor'" do
          expect(results['response']["numFound"]).to eq 3
          expect(results['response']["docs"][0]["type_s"]).to eq "subject"
          expect(results['response']["docs"][0]["label_s"]).to eq "Pearl Harbor, Attack on (Hawaii : 1941)"
          expect(results['response']["docs"][0]["variants_t"][0]).to eq "Attack on Pearl Harbor, Hawaii (1941)"
          expect(results['response']["docs"][1]["type_s"]).to eq "location"
          expect(results['response']["docs"][1]["label_s"]).to eq "Hawaii > Pearl Harbor"
          expect(results['response']["docs"][1]["rank_i"]).to eq 26
          expect(results['response']["docs"][2]["type_s"]).to eq "location"
          expect(results['response']["docs"][2]["label_s"]).to eq "Hawaii > Pearl Harbor National Wildlife Refuge"
        end
      end
      
      context "solr response where the query term is 'samuel langhorne'" do
        let(:uri) {uri = ENV["AUTOSUGGEST_URL"] + "/suggest/select?hl=on&indent=on&wt=json&sort=rank_i+desc&rows=100&q=samuel+langhorne"}
        let :results do
          controller.get_solr_response uri
        end
        before do
          stub_request(:get, uri)
            .to_return(status: 200, body: File.open(Rails.root.to_s + '/spec/fixtures/autosuggest_solr_resp_samuel_langhorne.json').read)
        end
        
        it "returns a solr response for the term 'samuel langhorne'" do
          expect(results['response']["numFound"]).to eq 1
          expect(results['response']["docs"][0]["type_s"]).to eq "author"
          expect(results['response']["docs"][0]["label_s"]).to eq "Clemens, Samuel Langhorne, 1835-1910"
          expect(results['response']["docs"][0]["label_suggest"][3]).to eq "Sieur Louis de Conte"
          expect(eval(results['response']["docs"][0]["pseudonyms_ss"][0])[:label]).to eq "Twain, Mark, 1835-1910"
        end
      end
      
    end    
  end

end
