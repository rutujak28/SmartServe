import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'order_update' | 'payment' | 'system' | 'kitchen';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

/**
 * Create a new notification for a user
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type,
  data,
}: CreateNotificationParams) => {
  try {
    const { data: result, error } = await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_title: title,
      p_message: message,
      p_type: type,
      p_data: data || null,
    });

    if (error) throw error;
    return { data: result, error: null };
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Notify user about order status change
 */
export const notifyOrderStatusChange = async (
  userId: string,
  orderId: string,
  status: string
) => {
  const statusMessages: Record<string, string> = {
    pending: 'Your order has been placed and is pending confirmation.',
    confirmed: 'Your order has been confirmed and will be prepared soon.',
    preparing: 'Your order is being prepared in the kitchen.',
    ready: 'Your order is ready for pickup!',
    served: 'Your order has been served. Enjoy your meal!',
    cancelled: 'Your order has been cancelled.',
  };

  return createNotification({
    userId,
    title: 'Order Status Updated',
    message: statusMessages[status] || `Your order is now ${status}`,
    type: 'order_update',
    data: { order_id: orderId, status },
  });
};

/**
 * Notify user about payment status
 */
export const notifyPaymentStatus = async (
  userId: string,
  orderId: string,
  status: 'success' | 'failed' | 'pending',
  amount?: number
) => {
  const messages = {
    success: `Payment of ₹${amount} completed successfully!`,
    failed: 'Payment failed. Please try again.',
    pending: 'Payment is being processed...',
  };

  return createNotification({
    userId,
    title: `Payment ${status === 'success' ? 'Successful' : status === 'failed' ? 'Failed' : 'Pending'}`,
    message: messages[status],
    type: 'payment',
    data: { order_id: orderId, status, amount },
  });
};

/**
 * Send system notification to user
 */
export const sendSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  data?: any
) => {
  return createNotification({
    userId,
    title,
    message,
    type: 'system',
    data,
  });
};

/**
 * Notify kitchen staff about new order
 */
export const notifyKitchenNewOrder = async (
  orderId: string,
  tableNumber: string,
  itemCount: number
) => {
  // Get all staff/admin users
  const { data: staffUsers } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['staff', 'admin']);

  if (!staffUsers) return;

  // Send notification to each staff member
  const notifications = staffUsers.map((staff) =>
    createNotification({
      userId: staff.user_id,
      title: 'New Order Received',
      message: `Table ${tableNumber} - ${itemCount} items`,
      type: 'kitchen',
      data: { order_id: orderId, table_number: tableNumber },
    })
  );

  await Promise.all(notifications);
};
