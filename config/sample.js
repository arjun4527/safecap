
const Product = require("../../models/productModel");
const Category = require("../../models/CategoryModel");
const User = require('../../models/userModel');
const Order = require('../../models/orderModel');
const PdfDocument = require('pdfkit');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');


const ExcelJS = require("exceljs");



const loadSalesPage = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 8);
    const period = req.query.period || 'daily';

    let startDate, endDate;

    if (period === 'custom' && req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.render('salesReport', {
          error: 'Invalid date range.',
          sales: [],
          totalSalesAmount: 0,
          totalCouponDiscount: 0,
          totalOfferDiscount: 0,
          chartData: null,
          period,
          currentPage: page,
          totalPages: 1,
          limit,
          startDate: req.query.startDate,
          endDate: req.query.endDate
        });
      }
    } else {
      switch (period) {
        case 'daily':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'weekly':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - startDate.getDay());
          endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'monthly':
          startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'yearly':
          startDate = new Date(new Date().getFullYear(), 0, 1);
          endDate = new Date(new Date().getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    }

    const skip = (page - 1) * limit;
    const query = { createdOn: { $gte: startDate, $lte: endDate } };

    const [sales, totalSalesCount] = await Promise.all([
      Order.find(query)
        .sort({ createdOn: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId')
        .populate('orderedItems.productId'),
      Order.countDocuments(query)
    ]);

    let totalSalesAmount = 0;
    let totalCouponDiscount = 0;
    let totalOfferDiscount = 0;

    const labels = [];
    const salesData = [];
    const discountData = [];

    sales.forEach(order => {
      let discount = 0;

      order.orderedItems.forEach(item => {
        if (item.productId && item.productId.regularPrice && item.productId.salePrice) {
          discount += (item.productId.regularPrice - item.productId.salePrice) * item.quantity;
        }
      });

      order.discount = discount;

      totalSalesAmount += order.finalAmount;
      totalOfferDiscount += discount;
      totalCouponDiscount += Math.max(0, order.orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - order.finalAmount);

      labels.push(new Date(order.createdOn).toLocaleDateString());
      salesData.push(order.finalAmount);
      discountData.push(discount);
    });

    const totalPages = Math.ceil(totalSalesCount / limit);

    res.render('salesReport', {
      sales,
      totalSalesAmount,
      totalCouponDiscount,
      totalOfferDiscount,
      chartData: { labels, salesData, discountData }, // Pass as an object
      period,
      currentPage: page,
      totalPages,
      limit,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      error: null
    });

  } catch (error) {
    console.error(error);
    res.render('salesReport', {
      sales: [],
      totalSalesAmount: 0,
      totalCouponDiscount: 0,
      totalOfferDiscount: 0,
      chartData: null,
      period: req.query.period || 'daily',
      currentPage: 1,
      totalPages: 1,
      limit: 8,
      startDate: null,
      endDate: null,
      error: 'Failed to load sales data. Please try again.'
    });
  }
};




 
const downloadSalesReportInPdf = async (req, res) => {
  try {
    const { period, startDate: startDateStr, endDate: endDateStr } = req.query;
    let startDate, endDate;

    // Handle custom date range
    if (period === 'custom' && startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Handle other periods
      switch (period) {
        case 'daily':
          startDate = new Date(new Date().setHours(0, 0, 0, 0));
          endDate = new Date(new Date().setHours(23, 59, 59, 999));
          break;
        case 'weekly':
          startDate = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
          endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6));
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'monthly':
          startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'yearly':
          startDate = new Date(new Date().getFullYear(), 0, 1);
          endDate = new Date(new Date().getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(new Date().setHours(0, 0, 0, 0));
          endDate = new Date(new Date().setHours(23, 59, 59, 999));
      }
    }

    // Fetch sales data
    const sales = await Order.find({
      createdOn: { $gte: startDate, $lte: endDate }
    }).populate('userId').populate('orderedItems.productId');

    let totalSalesAmount = 0;
    let totalCouponDiscount = 0;
    let totalDiscountAmount = 0;

    // Initialize PDF document definition
    const pdfDocDefinition = {
      content: [
        { text: 'Sales Report', style: 'header' },
        { text: Period: ${period || 'Custom'}, style: 'subheader' },
        { text: From: ${startDate.toDateString()} To: ${endDate.toDateString()}, style: 'subheader' },
        { text: '\n' },

        // Table for sales data
        {
          table: {
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'User', style: 'tableHeader' },
                { text: 'Date', style: 'tableHeader' },
                { text: 'Payment Method', style: 'tableHeader' },
                { text: 'Products Count', style: 'tableHeader' },
                { text: 'Discount', style: 'tableHeader' },
                { text: 'Coupon Discount', style: 'tableHeader' },
                { text: 'Final Amount', style: 'tableHeader' }
              ],
              // Loop through each sale and add rows
              ...sales.map((order) => {
                let productDiscount = 0;
                let subtotal = 0;

                order.orderedItems.forEach((item) => {
                  const regularPrice = item.productId.regularPrice;
                  const salePrice = item.productId.salePrice;
                  const quantity = item.quantity;
                  
                  subtotal += regularPrice * quantity;
                  productDiscount += (regularPrice - salePrice) * quantity;
                });

                const couponDiscount = Math.max(0, subtotal - productDiscount - order.finalAmount);
                
                totalSalesAmount += order.finalAmount;
                totalCouponDiscount += couponDiscount;
                totalDiscountAmount += productDiscount + couponDiscount;

                return [
                  order.userId.name,
                  order.createdOn.toDateString(),
                  order.paymentMethod,
                  order.orderedItems.length,
                  productDiscount.toFixed(2),
                  couponDiscount.toFixed(2),
                  order.finalAmount.toFixed(2)
                ];
              })
            ]
          },
          layout: 'lightHorizontalLines'
        },

        { text: '\n' },
        { text: Total Sales Amount: ₹${totalSalesAmount.toFixed(2)}, style: 'total' },
        { text: Total Coupon Discount: ₹${totalCouponDiscount.toFixed(2)}, style: 'total' },
        { text: Total Discount Amount: ₹${totalDiscountAmount.toFixed(2)}, style: 'total' }
      ],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
        },
        subheader: {
          fontSize: 14,
          italics: true,
          alignment: 'center',
          margin: [0, 10],
        },
        tableHeader: {
          bold: true,
          fillColor: '#f0f0f0',
        },
        total: {
          fontSize: 12,
          bold: true,
          margin: [0, 5],
        }
      }
    };

    const pdfDoc = pdfMake.createPdf(pdfDocDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', attachment; filename=sales_report_${period || 'custom'}.pdf);
    pdfDoc.getBuffer((buffer) => {
      res.end(buffer);
    });
  } catch (error) {
    console.error('Error generating PDF file:', error);
    res.status(500).send('Failed to generate PDF file. Please try again later.');
  }
};





const downloadSalesReportInExcel = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate, endDate;

    // Calculate date range based on period as before
    if (!period) {
      startDate = new Date(new Date().setHours(0, 0, 0, 0));
      endDate = new Date(new Date().setHours(23, 59, 59, 999));
    } else {
      switch (period) {
        case 'daily':
          startDate = new Date(new Date().setHours(0, 0, 0, 0));
          endDate = new Date(new Date().setHours(23, 59, 59, 999));
          break;
        case 'weekly':
          startDate = new Date(new Date().setDate(new Date().getDate() - new Date().getDay()));
          endDate = new Date(new Date(startDate).setDate(startDate.getDate() + 6));
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'monthly':
          startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'yearly':
          startDate = new Date(new Date().getFullYear(), 0, 1);
          endDate = new Date(new Date().getFullYear(), 11, 31);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          startDate = new Date(req.query.startDate);
          endDate = new Date(req.query.endDate);
          endDate.setHours(23, 59, 59, 999);
          break;
      }
    }

    // Fetch sales data
    const sales = await Order.find({
      createdOn: { $gte: startDate, $lte: endDate }
    }).populate('userId').populate('orderedItems.productId');

    // Initialize workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add headers
    worksheet.columns = [
      { header: 'User', key: 'user', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 20 },
      { header: 'Products Count', key: 'productsCount', width: 15 },
      { header: 'Discount', key: 'discount', width: 15 },
      { header: 'Coupon Discount', key: 'couponDiscount', width: 15 },
      { header: 'Final Amount', key: 'finalAmount', width: 15 },
    ];

    let totalSalesAmount = 0;
    let totalCouponDiscount = 0;
    let totalDiscountAmount = 0;

    // Populate rows with sales data
    sales.forEach((order) => {
      let discount = 0;
      let totalValue = 0;

      order.orderedItems.forEach((item) => {
        const regularPrice = item.productId.regularPrice;
        const salePrice = item.productId.salePrice;
        const quantity = item.quantity;

        // Calculate total value and discount
        totalValue += item.totalPrice;
        discount += (regularPrice - salePrice) * quantity;
      });

      const couponDiscount = Math.max(0, totalValue - order.finalAmount);
      totalSalesAmount += order.finalAmount;
      totalCouponDiscount += couponDiscount;
      totalDiscountAmount += discount+couponDiscount;
      worksheet.addRow({
        user: order.userId.name,
        date: order.createdOn.toDateString(),
        paymentMethod: order.paymentMethod,
        productsCount: order.orderedItems.length,
        discount: discount.toFixed(2),
        couponDiscount: couponDiscount.toFixed(2),
        finalAmount: order.finalAmount.toFixed(2),
      });
    });

    // Add totals to the worksheet
    worksheet.addRow([]);
    worksheet.addRow({ user: 'Total Sales Amount', finalAmount: totalSalesAmount.toFixed(2) });
    worksheet.addRow({ user: 'Total Coupon Discount', finalAmount: totalCouponDiscount.toFixed(2) });
    worksheet.addRow({ user: 'Total Discount Amount', finalAmount: totalDiscountAmount.toFixed(2) });


    // Set response headers and send Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', attachment; filename=sales_report_${period || 'custom'}.xlsx);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Failed to generate Excel file. Please try again later.');
  }
};




module.exports = {
  loadSalesPage,
  downloadSalesReportInExcel,
  downloadSalesReportInPdf
};