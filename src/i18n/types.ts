export type LanguageCode = 'en' | 'hi';

export interface LanguageInfo {
  code: LanguageCode;
  label: string; // Native script
  englishName: string;
  isRTL?: boolean;
  script?: string;
}

export interface TranslationDictionary {
  // Navigation & Brand
  nav_brand_title: string;
  nav_brand_sub: string;
  nav_grid_live: string;
  nav_grid_syncing: string;
  nav_grid_offline: string;
  nav_dashboard: string;
  nav_cases: string;
  nav_review: string;
  nav_report_missing: string;
  nav_report_found: string;
  nav_report_hospital: string;
  nav_emergency_hotline: string;
  nav_role_label: string;
  nav_role_family: string;
  nav_role_field: string;
  nav_role_hospital: string;
  nav_role_coordinator: string;
  nav_sign_in: string;
  nav_sign_out: string;
  nav_voice_ai: string;
  nav_forensic_dossiers: string;
  nav_sign_up: string;
  nav_select_persona: string;
  nav_guest: string;

  // Emergency Notice Banner
  notice_banner_title: string;
  notice_banner_desc: string;
  notice_ndrf: string;
  notice_police: string;
  notice_ambulance: string;
  notice_childline: string;

  // Hero Section
  hero_network_tag: string;
  hero_simulated_tag: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_missing: string;
  hero_cta_found: string;
  hero_cta_search: string;
  hero_trust_offline: string;
  hero_trust_privacy: string;
  hero_trust_safeguard: string;

  // Candidate Dossier Card
  dossier_title: string;
  dossier_uid: string;
  dossier_source_a: string;
  dossier_source_b: string;
  dossier_confidence_label: string;
  dossier_confidence_val: string;
  dossier_scars_label: string;
  dossier_scars_val: string;
  dossier_scars_badge: string;
  dossier_clothing_label: string;
  dossier_clothing_val: string;
  dossier_clothing_badge: string;
  dossier_age_label: string;
  dossier_age_val: string;
  dossier_age_badge: string;
  dossier_zone_label: string;
  dossier_zone_val: string;
  dossier_zone_badge: string;
  dossier_blood_label: string;
  dossier_blood_val: string;
  dossier_blood_badge: string;
  dossier_signoff_title: string;
  dossier_signoff_desc: string;

  // Operational Status Strip
  status_operational_mesh: string;
  status_sync_frequency: string;
  status_active_nodes: string;
  status_connected_camps: string;
  status_triage_wards: string;
  status_verified_reunions: string;

  // Section 1: The Problem (Information Chaos)
  problem_tag: string;
  problem_title: string;
  problem_desc: string;
  problem_family_label: string;
  problem_family_desc: string;
  problem_field_label: string;
  problem_field_desc: string;
  problem_hospital_label: string;
  problem_hospital_desc: string;
  problem_milan_core: string;
  problem_milan_desc: string;

  // Section 2: Data Transformation
  trans_tag: string;
  trans_title: string;
  trans_desc: string;
  trans_raw_title: string;
  trans_table_title: string;
  trans_col_attr: string;
  trans_col_extracted: string;
  trans_col_confidence: string;
  trans_attr_name: string;
  trans_attr_age: string;
  trans_attr_gender: string;
  trans_attr_clothing: string;
  trans_attr_marks: string;
  trans_attr_status: string;

  // Section 3: Reconciliation Pipeline
  pipeline_tag: string;
  pipeline_title: string;
  pipeline_desc: string;
  pipeline_s1_title: string;
  pipeline_s1_desc: string;
  pipeline_s2_title: string;
  pipeline_s2_desc: string;
  pipeline_s3_title: string;
  pipeline_s3_desc: string;
  pipeline_s4_title: string;
  pipeline_s4_desc: string;
  pipeline_s5_title: string;
  pipeline_s5_desc: string;

  // Section 4: Human Verification & Anti-Trafficking
  safeguards_tag: string;
  safeguards_title: string;
  safeguards_desc: string;
  safeguards_r1_title: string;
  safeguards_r1_desc: string;
  safeguards_r2_title: string;
  safeguards_r2_desc: string;
  safeguards_r3_title: string;
  safeguards_r3_desc: string;

  // Section 5: Three Operational Domains
  domains_tag: string;
  domains_title: string;
  domains_desc: string;
  domains_family_title: string;
  domains_family_desc: string;
  domains_family_cta: string;
  domains_rescue_title: string;
  domains_rescue_desc: string;
  domains_rescue_cta: string;
  domains_hospital_title: string;
  domains_hospital_desc: string;
  domains_hospital_cta: string;

  // Section 6: Persona Strip
  personas_tag: string;
  personas_title: string;
  personas_desc: string;
  personas_family_badge: string;
  personas_family_action: string;
  personas_ngo_badge: string;
  personas_ngo_action: string;
  personas_hospital_badge: string;
  personas_hospital_action: string;
  personas_coord_badge: string;
  personas_coord_action: string;

  // Section 7: Closing CTA
  closing_title: string;
  closing_desc: string;
  closing_cta_report: string;
  closing_cta_directory: string;

  // Common UI Actions & Form
  btn_continue: string;
  btn_previous: string;
  btn_submit: string;
  btn_cancel: string;
  btn_save_draft: string;
  btn_submitting: string;
  voice_input_trigger: string;
  voice_input_title: string;
  voice_input_hint: string;
  voice_input_parse: string;

  // Cases Page & Directory
  cases_title: string;
  cases_subtitle: string;
  cases_search_placeholder: string;
  cases_filter_all: string;
  cases_filter_missing: string;
  cases_filter_found: string;
  cases_filter_hospitalized: string;
  cases_filter_reunited: string;
  cases_col_person: string;
  cases_col_type: string;
  cases_col_location: string;
  cases_col_status: string;
  cases_col_confidence: string;
  cases_col_actions: string;
  cases_view_details: string;
  cases_empty_title: string;
  cases_empty_desc: string;

  // Footer
  footer_tagline: string;
  footer_disclaimer: string;
  footer_quick_links: string;
  footer_emergency_contacts: string;
  footer_copyright: string;
}
