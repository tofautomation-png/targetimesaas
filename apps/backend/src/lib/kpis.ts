import { baserowClient } from './baserow';

export interface KPIData {
  bookingsToday: number;
  revenue30d: number;
  newClients7d: number;
  noShows7d: number;
}

export async function calculateKPIs(agencyCode: string): Promise<KPIData> {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get table IDs
    const appointmentsTableId = await baserowClient.getTableId('appointments_table', agencyCode);
    const welcomeClientsTableId = await baserowClient.getTableId('clients_welcome', agencyCode);

    let bookingsToday = 0;
    let revenue30d = 0;
    let newClients7d = 0;
    let noShows7d = 0;

    // Calculate bookings today
    if (appointmentsTableId) {
      const appointments = await baserowClient.listRows(appointmentsTableId);
      
      for (const appointment of appointments) {
        const startsAt = appointment.starts_at;
        if (!startsAt) continue;

        const appointmentDate = new Date(startsAt).toISOString().split('T')[0];
        const appointmentDateTime = new Date(startsAt);
        
        // Bookings today
        if (appointmentDate === today) {
          bookingsToday++;
        }

        // Revenue last 30 days
        if (appointmentDateTime >= new Date(thirtyDaysAgo)) {
          const status = appointment.status?.toLowerCase();
          if (status === 'completed' || status === 'paid') {
            const value = parseFloat(appointment.value) || 0;
            revenue30d += value;
          }
        }

        // No shows last 7 days
        if (appointmentDateTime >= new Date(sevenDaysAgo)) {
          const status = appointment.status?.toLowerCase();
          if (status === 'no_show' || status === 'no-show') {
            noShows7d++;
          }
        }
      }
    }

    // Calculate new clients last 7 days
    if (welcomeClientsTableId) {
      const clients = await baserowClient.listRows(welcomeClientsTableId);
      
      for (const client of clients) {
        const createdAt = client.created_at;
        if (createdAt && new Date(createdAt) >= new Date(sevenDaysAgo)) {
          newClients7d++;
        }
      }
    }

    return {
      bookingsToday,
      revenue30d,
      newClients7d,
      noShows7d
    };
  } catch (error) {
    console.error('Error calculating KPIs:', error);
    // Return zeros if there's an error
    return {
      bookingsToday: 0,
      revenue30d: 0,
      newClients7d: 0,
      noShows7d: 0
    };
  }
}
