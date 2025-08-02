import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Inquiry from '../models/Inquiry';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // We can run these database queries in parallel for better performance
    const [totalRevenueResult, totalOrders, totalUsers, newInquiries, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.countDocuments(),
      User.countDocuments(),
      Inquiry.countDocuments({ status: 'New' }),
      Order.find({}).sort({ createdAt: -1 }).limit(5).populate('user', 'name'),
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // This is the one and only response for this request
    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers,
        newInquiries,
        recentOrders,
      },
    });

  } catch (error) {
    // If any of the promises fail, it will be caught here.
    console.error('DASHBOARD STATS FAILED:', error);
    // This is the one and only error response for this request
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};