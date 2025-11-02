import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, UserPlus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  phone?: string;
  contact_user_id: string;
}

interface ContactManagerProps {
  userId: string;
}

const ContactManager = ({ userId }: ContactManagerProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [contactUserId, setContactUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load contacts");
      return;
    }

    setContacts(data || []);
  };

  const addContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactUserId.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId,
        name: name.trim(),
        contact_user_id: contactUserId.trim(),
        phone: phone.trim(),
      });

    setLoading(false);

    if (error) {
      toast.error("Failed to add contact");
      return;
    }

    toast.success("Contact added!");
    setName("");
    setContactUserId("");
    setPhone("");
  };

  const deleteContact = async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete contact");
      return;
    }

    toast.success("Contact deleted");
  };
  const sendWhatsAppMessage = (contact: Contact) => {
    if (!contact.phone) {
      toast.error("No phone number saved for this contact");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `🚨 Emergency Alert from SafePath!\n\nI need help! My current location is: ${locationUrl}`;
        const formattedPhone = contact.phone.replace(/[\s+-]/g, '');
        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
        window.open(waUrl, '_blank');
        toast.success("Opening WhatsApp...");
      },
      (error) => {
        toast.error("Could not get location. Please enable location access.");
        console.error("Geolocation error:", error);
      }
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          My Emergency Contacts
        </CardTitle>
        <CardDescription>
          Add trusted contacts who will receive your SOS alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={addContact} className="space-y-3">
          <Input
            placeholder="Contact Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Contact's User ID"
            value={contactUserId}
            onChange={(e) => setContactUserId(e.target.value)}
            required
          />
          <Input
            placeholder="Phone Number (e.g., +15551234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Contact"}
          </Button>
        </form>

        <div className="space-y-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No contacts added yet
            </p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {contact.contact_user_id}
                  </p>
                  {contact.phone && (
                    <p className="text-xs text-muted-foreground">
                      Phone: {contact.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {contact.phone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => sendWhatsAppMessage(contact)}
                      title="Send WhatsApp message"
                    >
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteContact(contact.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteContact(contact.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button> */}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactManager;
