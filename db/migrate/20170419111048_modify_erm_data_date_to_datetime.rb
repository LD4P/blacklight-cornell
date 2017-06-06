# -*- coding: utf-8 -*-
class ModifyErmDataDateToDatetime < ActiveRecord::Migration
  def up
  if !ActiveRecord::Base.connection.table_exists? "erm_data" 
  create_table "erm_data", id: false, force: true do |t|
    t.integer  "id",                                               limit: 4
    t.string   "Collection_Name",                                  limit: 128
    t.string   "Collection_ID",                                    limit: 20
    t.string   "Provider_name",                                    limit: 128
    t.string   "Provider_Code",                                    limit: 128
    t.string   "Database_Name",                                    limit: 128
    t.string   "Database_Code",                                    limit: 64
    t.string   "Database_Status",                                  limit: 128
    t.string   "Title_Name",                                       limit: 128
    t.string   "Title_ID",                                         limit: 20
    t.string   "Title_Status",                                     limit: 128
    t.string   "ISSN",                                             limit: 128
    t.string   "eISSN",                                            limit: 128
    t.string   "ISBN",                                             limit: 128
    t.string   "SSID",                                             limit: 128
    t.string   "Prevailing",                                       limit: 64
    t.string   "License_Name",                                     limit: 256
    t.string   "Origin",                                           limit: 256
    t.string   "License_ID",                                       limit: 64
    t.string   "Type",                                             limit: 256
    t.string   "Vendor_License_URL",                               limit: 256
    t.string   "Vendor_License_URL_Visible_In_Public_Display",     limit: 16
    t.datetime "Vendor_License_URL_Date_Accessed"
    t.string   "Second_Vendor_License_URL",                        limit: 256
    t.string   "Local_License_URL",                                limit: 256
    t.string   "Local_License_URL_Visible_In_Public_Display",      limit: 16
    t.string   "Second_Local_License_URL",                         limit: 256
    t.string   "Physical_Location",                                limit: 256
    t.string   "Status",                                           limit: 128
    t.string   "Reviewer",                                         limit: 256
    t.text     "Reviewer_Note",                                    limit: 65535
    t.string   "License_Replaced_By",                              limit: 256
    t.string   "License_Replaces",                                 limit: 256
    t.datetime "Execution_Date"
    t.datetime "Start_Date"
    t.datetime "End_Date"
    t.string   "Advance_Notice_in_Days",                           limit: 64
    t.text     "License_Note",                                     limit: 65535
    t.datetime "Date_Created"
    t.datetime "Last_Updated"
    t.text     "Template_Note",                                    limit: 65535
    t.string   "Authorized_Users",                                 limit: 256
    t.text     "Authorized_Users_Note",                            limit: 65535
    t.binary   "Concurrent_Users",                                 limit: 65535
    t.text     "Concurrent_Users_Note",                            limit: 65535
    t.string   "Fair_Use_Clause_Indicator",                        limit: 256
    t.string   "Database_Protection_Override_Clause_Indicator",    limit: 16
    t.string   "All_Rights_Reserved_Indicator",                    limit: 16
    t.string   "Citation_Requirement_Detail",                      limit: 256
    t.string   "Digitally_Copy",                                   limit: 256
    t.binary   "Digitally_Copy_Note",                              limit: 65535
    t.string   "Print_Copy",                                       limit: 256
    t.string   "Print_Copy_Note",                                  limit: 256
    t.string   "Scholarly_Sharing",                                limit: 128
    t.string   "Scholarly_Sharing_Note",                           limit: 256
    t.string   "Distance_Learning",                                limit: 128
    t.string   "Distance_Learning_Note",                           limit: 256
    t.string   "ILL_General",                                      limit: 256
    t.string   "ILL_Secure_Electronic",                            limit: 256
    t.string   "ILL_Electronic_email",                             limit: 256
    t.string   "ILL_Record_Keeping",                               limit: 128
    t.text     "ILL_Record_Keeping_Note",                          limit: 65535
    t.string   "Course_Reserve",                                   limit: 128
    t.string   "Course_Reserve_Note",                              limit: 256
    t.string   "Electronic_Link",                                  limit: 128
    t.string   "Electronic_Link_Note",                             limit: 256
    t.string   "Course_Pack_Print",                                limit: 128
    t.string   "Course_Pack_Electronic",                           limit: 128
    t.binary   "Course_Pack_Note",                                 limit: 65535
    t.string   "Remote_Access",                                    limit: 128
    t.string   "Remote_Access_Note",                               limit: 256
    t.binary   "Other_Use_Restrictions_Staff_Note",                limit: 65535
    t.string   "Other_Use_Restrictions_Public_Note",               limit: 256
    t.string   "Perpetual_Access_Right",                           limit: 128
    t.text     "Perpetual_Access_Note",                            limit: 65535
    t.binary   "Perpetual_Access_Holdings",                        limit: 65535
    t.string   "Licensee_Termination_Right",                       limit: 128
    t.string   "Licensee_Termination_Condition",                   limit: 128
    t.string   "Licensee_Termination_Note",                        limit: 256
    t.string   "Licensee_Notice_Period_For_Termination_Number",    limit: 128
    t.string   "Licensee_Notice_Period_For_Termination_Unit",      limit: 128
    t.string   "Licensor_Termination_Right",                       limit: 128
    t.string   "Licensor_Termination_Condition",                   limit: 128
    t.string   "Licensor_Termination_Note",                        limit: 256
    t.string   "Licensor_Notice_Period_For_Termination_Number",    limit: 128
    t.string   "Licensor_Notice_Period_For_Termination_Unit",      limit: 256
    t.binary   "Termination_Right_Note",                           limit: 65535
    t.string   "Termination_Requirements",                         limit: 256
    t.string   "Termination_Requirements_Note",                    limit: 256
    t.string   "Terms_Note",                                       limit: 256
    t.string   "Local_Use_Terms_Note",                             limit: 256
    t.string   "Governing_Law",                                    limit: 256
    t.string   "Governing_Jurisdiction",                           limit: 256
    t.string   "Applicable_Copyright_Law",                         limit: 256
    t.string   "Cure_Period_For_Breach_Number",                    limit: 256
    t.string   "Cure_Period_For_Breach_Unit",                      limit: 256
    t.string   "Renewal_Type",                                     limit: 128
    t.string   "Non_Renewal_Notice_Period_Number",                 limit: 128
    t.string   "Non_Renewal_Notice_Period_Unit",                   limit: 128
    t.string   "Archiving_Right",                                  limit: 128
    t.string   "Archiving_Format",                                 limit: 256
    t.text     "Archiving_Note",                                   limit: 65535
    t.string   "Pre_Print_Archive_Allowed",                        limit: 128
    t.string   "Pre_Print_Archive_Conditions",                     limit: 256
    t.string   "Pre_Print_Archive_Restrictions_Number",            limit: 128
    t.string   "Pre_Print_Archive_Restrictions_Unit",              limit: 128
    t.string   "Pre_Print_Archive_Note",                           limit: 256
    t.string   "Post_Print_Archive_Allowed",                       limit: 128
    t.string   "Post_Print_Archive_Conditions",                    limit: 256
    t.string   "Post_Print_Archive_Restrictions_Number",           limit: 128
    t.string   "Post_Print_Archive_Restrictions_Unit",             limit: 128
    t.binary   "Post_Print_Archive_Note",                          limit: 65535
    t.string   "Incorporation_Of_Images_Figures_And_Tables_Right", limit: 256
    t.text     "Incorporation_Of_Images_Figures_And_Tables_Note",  limit: 65535
    t.string   "Public_Performance_Right",                         limit: 256
    t.text     "Public_Performance_Note",                          limit: 65535
    t.string   "Training_Materials_Right",                         limit: 256
    t.text     "Training_Materials_Note",                          limit: 65535
  end
  
  end

  end

  def down
  end
end