import { Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';
import Inquiry from '../models/Inquiry'; // Assuming you have an Inquiry model

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/dashboard
 * @access  Private/Admin
 */
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // Use Promise.all to run queries in parallel for better performance
    const [
      totalRevenueResult,
      totalOrders,
      newInquiries,
      totalUsers,
      recentOrders,
      salesData,
    ] = await Promise.all([
      // 1. Calculate Total Revenue from paid orders
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      // 2. Count all orders
      Order.countDocuments(),
      // 3. Count new inquiries
      Inquiry.countDocuments({ status: 'New' }),
      // 4. Count all users
      User.countDocuments(),
      // 5. Get the 5 most recent orders
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').lean(),
      // 6. Get Sales Data for the chart (same logic as your sales-stats route)
      Order.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
            sales: { $sum: '$totalPrice' },
          },
        },
        { $sort: { _id: 1 } }, // Sort by date
      ]),
    ]);

    // Format the data for the final response
    const dashboardStats = {
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalOrders,
      newInquiries,
      totalUsers,
      recentOrders,
      salesData, // This is the data your chart needs
    };

    res.status(200).json({
      success: true,
      data: dashboardStats,
    });
  } catch (error) {
    console.error('Dashboard data fetching error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};