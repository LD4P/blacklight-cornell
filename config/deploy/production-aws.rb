#server "da-prod-web1.library.cornell.edu", "da-prod-web2.library.cornell.edu", :app, :web, :db, :primary => true
role :app, "newcatalog7.library.cornell.edu"
role :web, "newcatalog7.library.cornell.edu"
role :db, "newcatalog7.library.cornell.edu", :primary => true

role :app, "newcatalog8.library.cornell.edu"
role :web, "newcatalog8.library.cornell.edu"
role :db, "newcatalog8.library.cornell.edu", :primary => true

role :app, "newcatalog9.library.cornell.edu"
role :web, "newcatalog9.library.cornell.edu"
role :db, "newcatalog9.library.cornell.edu", :primary => true

desc "Install newrelic file -- too sensitive for git - production"
task :install_new_relic_yml, :roles => [ :app, :db, :web ] do
        run "cat #{deploy_to}/../common/config/newrelic.yml  | sed -e 's/developer_mode:.*true/developer_mode: false/' > #{release_path}/config/newrelic.yml"          
end

set :deploy_to, "/cul/web/newcatalog.library.cornell.edu/rails-app"
#this avoids an error message from git, but i don't think it's really necessary.
#as i don't think the message actually affects what gets installed.
set :branch, ENV['GIT_BRANCH'].gsub("origin/","")
task :install_env, :roles => [ :app, :db, :web ] do
  run "cp #{deploy_to}/../conf/production.env  #{shared_path}/.env"
end
