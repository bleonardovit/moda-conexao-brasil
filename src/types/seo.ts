
export interface SEOSettings {
  id: string;
  site_title: string;
  site_description: string;
  site_image_url?: string;
  site_url: string;
  site_name: string;
  author?: string;
  keywords: string[];
  twitter_handle?: string;
  facebook_app_id?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface SEOUpdateData {
  site_title: string;
  site_description: string;
  site_image_url?: string;
  site_url: string;
  site_name: string;
  author?: string;
  keywords: string[];
  twitter_handle?: string;
  facebook_app_id?: string;
}
