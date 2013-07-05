$LOAD_PATH.unshift File.join(File.dirname(__FILE__), 'deploy')
set :application, "blacklight-cornell"
set :repository,  "git@git.library.cornell.edu:/blacklight-cornell"
set :scm, :git
set :use_sudo, false
#set :user, "jac244"
set :user, "rails"
set :default_environment, {
  'PATH' => "/usr/local/rvm/gems/ruby-1.9.3-p194@blacklight/bin:/usr/local/rvm/gems/ruby-1.9.3-p194/bin:/usr/local/rvm/gems/ruby-1.9.3-p194@global/bin:/usr/local/rvm/rubies/ruby-1.9.3-p194/bin:/usr/local/rvm/bin:$PATH",
  'RUBY_VERSION' => "ruby 1.9.3-p194",
  'GEM_HOME'     => "/usr/local/rvm/gems/ruby-1.9.3-p194",
  'GEM_PATH'     => "/usr/local/rvm/gems/ruby-1.9.3-p194:/usr/local/rvm/gems/ruby-1.9.3-p194@global",
  'BUNDLE_PATH'  => "/usr/local/rvm/gems/ruby-1.9.3-p194@global/gems/bundler-1.3.5/"  # If you are using bundler.
}

set :deploy_to, "/users/#{user}"

#role  :app, "culsearchdev.library.cornell.edu"
#role  :web, "culsearchdev.library.cornell.edu"
#role  :db, "culsearchdev.library.cornell.edu", :primary => true

require 'bundler/capistrano'
require 'capistrano/ext/multistage'
require 'capistrano_database_yml'

set :stages, ["staging", "production"]
set :default_stage, "staging"
default_run_options[:pty] = true

task :cold do
  transaction do
    update
    setup_db  #replacing migrate in original
    start
  end
end

task :setup_db, :roles => :app do
  raise RuntimeError.new('db:setup aborted!') unless Capistrano::CLI.ui.ask("About to `rake db:setup`. Are you sure to wipe the entire database (anything other than 'yes' aborts):") == 'yes'
  run "cd #{current_path}; bundle exec rake db:setup RAILS_ENV=#{rails_env}"
end

task :allmigrate, :roles => :db  do
    rake = fetch(:rake, "rake")
    rails_env = fetch(:rails_env, "production")
    migrate_env = fetch(:migrate_env, "")
    migrate_target = fetch(:migrate_target, :latest)

    directory = case migrate_target.to_sym
      when :current then current_path
      when :latest  then latest_release
      else raise ArgumentError, "unknown migration target #{migrate_target.inspect}"
      end

    run "cd #{directory} && #{rake} RAILS_ENV=#{rails_env} #{migrate_env} db:migrate"
end

desc "Fix file permissions"
task :fix_file_permissions, :roles => [ :app, :db, :web ] do
	run "chmod -R g+rw #{deploy_to}"
end

after :deploy, "fix_file_permissions"
# If you are using Passenger mod_rails uncomment this:
# namespace :deploy do
#   task :start do ; end
#   task :stop do ; end
#   task :restart, :roles => :app, :except => { :no_release => true } do
#     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
#   end
# end
