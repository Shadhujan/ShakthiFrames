import { Request, Response } from 'express';
import Order, { IOrder } from '../models/Order';
import transporter from '../config/nodemailer';

/**
 * @desc    Get all orders
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
export const getOrders = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, order: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // --- THIS IS THE MAIN FIX ---
    // Add the type <IOrder> to tell TypeScript what 'order' will be.
    const order: IOrder | null = await Order.findById(req.params.id);

    if (order) {
      const { status } = req.body;
      const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
      if (!status || !allowedStatuses.includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid status provided' });
        return;
      }

      // TypeScript now knows that 'deliveredAt' is a valid property on the 'order' object.
      order.orderStatus = status;
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      }

      const updatedOrder = await order.save();
      res.status(200).json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/v1/orders
 * @access  Private (for logged-in users)
 */
export const createOrder = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // 1. Authenticated User Check (from 'protect' middleware)
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, no user data' });
    }

    // 2. Destructure all expected properties from the request body
    const {
      orderItems,
      shippingAddress,
      totalPrice,
      isPaid,
      paidAt,
      paymentResult
    } = req.body;

    // 3. Validation: Ensure there are items in the order
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // 4. Transform frontend data to match the backend schema
    // This is a crucial step to prevent validation errors.
    const transformedOrderItems = orderItems.map((item: any) => ({
      name: item.name,
      qty: item.quantity, // The frontend sends 'quantity', but our schema uses 'qty'
      image: item.image,
      price: item.price,
      product: item.product, // This should be the MongoDB ObjectId for the product
    }));

    // 5. Create a new Order instance with the validated and transformed data
    const order = new Order({
      user: req.user._id, // Attach the order to the logged-in user
      orderItems: transformedOrderItems,
      shippingAddress,
      totalPrice,
      isPaid,
      paidAt,
      paymentResult,
    });

    // 6. Save the order to the database
    const createdOrder = await order.save();

    // 7. Send the success response back to the client immediately.
    // Don't make the user wait for the email to be sent.
    res.status(201).json({ success: true, order: createdOrder });

    // 8. Asynchronously send the confirmation email in the background.
    try {
      const mailOptions = {
        from: `"Shakthi Picture Framing" <${process.env.SENDER_EMAIL}>`,
        to: req.user.email,
        subject: `Your Order Confirmation #${createdOrder._id}`,
        html: `
          <h1>Thank you for your order, ${req.user.name}!</h1>
          <p>We've received your order and will begin processing it shortly.</p>
          <h2>Order Summary</h2>
          <p><strong>Order ID:</strong> ${createdOrder._id}</p>
          <p><strong>Total Amount:</strong> $${createdOrder.totalPrice.toFixed(2)}</p>
          <p>We will notify you again once your order has shipped.</p>
        `,
      };
      await transporter.sendMail(mailOptions);
      console.log(`Order confirmation email sent successfully to ${req.user.email}`);
    } catch (emailError) {
      // If the email fails, just log it. The order was still created successfully.
      console.error(`Failed to send order confirmation email for order ${createdOrder._id}:`, emailError);
    }

  } catch (error) {
    // This will catch any errors from the database save operation
    console.error("CREATE ORDER FAILED:", error);
    if (!res.headersSent) { // Prevent sending a second response if one was already sent
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};


/**
 * @desc    Get logged in user's orders
 * @route   GET /api/v1/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user data' });
    }
    // Find orders where the 'user' field matches the logged-in user's ID
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Get My Orders error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};