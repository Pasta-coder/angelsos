-- Create contacts table for managing emergency contacts
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can view their own contacts" 
ON public.contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
ON public.contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create settings table for user preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  prewritten_message TEXT DEFAULT 'Emergency! I need help. My location:',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings
CREATE POLICY "Users can view their own settings" 
ON public.user_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create SOS alerts table for emergency notifications
CREATE TABLE public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  recipient_user_id UUID NOT NULL,
  location JSONB NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for SOS alerts
CREATE POLICY "Users can view alerts sent to them" 
ON public.sos_alerts 
FOR SELECT 
USING (auth.uid() = recipient_user_id);

CREATE POLICY "Anyone can create SOS alerts" 
ON public.sos_alerts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can delete their own alerts" 
ON public.sos_alerts 
FOR DELETE 
USING (auth.uid() = recipient_user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for contacts and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;