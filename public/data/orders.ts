export const orders = [
  {
    orderId: "ORD-001",
    date: "01/12/23",
    status: "Delivered",
    totalAmount: 207.75,
  },
  {
    orderId: "ORD-002",
    date: "01/15/23",
    status: "Delivered",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-003",
    date: "02/05/24",
    status: "Processing",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-004",
    date: "02/20/24",
    status: "Cancelled",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-005",
    date: "03/01/24",
    status: "Delivered",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-006",
    date: "03/10/24",
    status: "Delivered",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-007",
    date: "03/15/25",
    status: "Shipped",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-008",
    date: "03/22/25",
    status: "Delivered",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-009",
    date: "04/01/25",
    status: "Processing",
    totalAmount: 199.99,
  },
  {
    orderId: "ORD-010",
    date: "04/05/25",
    status: "Delivered",
    totalAmount: 225.75,
  },
  {
    orderId: "ORD-011",
    date: "04/12/25",
    status: "Cancelled",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-012",
    date: "04/20/25",
    status: "Shipped",
    totalAmount: 189.49,
  },
  {
    orderId: "ORD-013",
    date: "05/01/25",
    status: "Delivered",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-014",
    date: "05/10/25",
    status: "Delivered",
    totalAmount: 205.0,
  },
  {
    orderId: "ORD-015",
    date: "05/15/25",
    status: "Processing",
    totalAmount: 220.99,
  },
  {
    orderId: "ORD-016",
    date: "05/20/25",
    status: "Cancelled",
    totalAmount: 210.75,
  },
  {
    orderId: "ORD-017",
    date: "06/01/25",
    status: "Delivered",
    totalAmount: 199.0,
  },
  {
    orderId: "ORD-018",
    date: "06/10/25",
    status: "Shipped",
    totalAmount: 230.49,
  },
  {
    orderId: "ORD-019",
    date: "06/18/25",
    status: "Delivered",
    totalAmount: 215.49,
  },
  {
    orderId: "ORD-020",
    date: "06/25/25",
    status: "Processing",
    totalAmount: 222.25,
  },
];

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getOrderDate = (status: string): string => {
  const today = new Date();

  switch (status) {
    case "Due Today":
      return today.toLocaleDateString("en-US");

    case "Due Tomorrow":
      return addDays(today, 1).toLocaleDateString("en-US");

    case "Due in Three Days":
      return addDays(today, 3).toLocaleDateString("en-US");

    case "Due this Week":
      return addDays(today, 5).toLocaleDateString("en-US");

    case "Due this month":
      return addDays(today, 15).toLocaleDateString("en-US");

    default:
      return today.toLocaleDateString("en-US");
  }
};

export const paymentOrders = [
  {
    id: "1",
    orderNumber: "PO-001",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
      {
        id: "3",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
      {
        id: "4",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
      {
        id: "5",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due Today"),
    totalPrice: 699.97,
    isDueToday: "Due Today",
  },
  {
    id: "2",
    orderNumber: "PO-002",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "AFA-250 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due Today"),
    totalPrice: 309.97,
    isDueToday: "Due Today",
  },
  {
    id: "3",
    orderNumber: "PO-003",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due in Three Days"),
    totalPrice: 309.97,
    isDueToday: "Due in Three Days",
  },
  {
    id: "4",
    orderNumber: "PO-004",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due Tomorrow"),
    totalPrice: 309.97,
    isDueToday: "Due Tomorrow",
  },
  {
    id: "5",
    orderNumber: "PO-005",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due in Three Days"),
    totalPrice: 309.97,
    isDueToday: "Due in Three Days",
  },
  {
    id: "6",
    orderNumber: "PO-006",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due this Week"),
    totalPrice: 309.97,
    isDueToday: "Due this Week",
  },
  {
    id: "7",
    orderNumber: "PO-007",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due this month"),
    totalPrice: 309.97,
    isDueToday: "Due this month",
  },
  {
    id: "8",
    orderNumber: "PO-008",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 No DAC (5mg) / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg) x 1",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
      },
    ],
    orderedOn: getOrderDate("Due in Three Days"),
    totalPrice: 309.97,
    isDueToday: "Due in Three Days",
  },
];

export const ordersHistory = [
   {
    id: "1",
    orderNumber: "PO-001",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
        image: "/images/products/p1.png",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg)",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
        image: "/images/products/p2.png",
      },
    ],
    orderedOn: getOrderDate("Due Today"),
    totalPrice: 309.97,
    status: "Delivered",
  },
  {
    id: "2",
    orderNumber: "PO-002",
    doctorName: "Dr. Michael Adams",
    orderItems: [
      {
        id: "1",
        medicineName: "BPC-157 (5mg)",
        quantity: 3,
        price: 59.99,
        amount: "5 mg vial",
        image: "/images/products/p5.png",
      },
      {
        id: "2",
        medicineName: "TB-500 (5mg)",
        quantity: 1,
        price: 74.99,
        amount: "5 mg vial",
        image: "/images/products/p6.png",
      },
    ],
    orderedOn: getOrderDate("Due Tomorrow"),
    totalPrice: 254.96,
    status: "Processing",
  },
  {
    id: "3",
    orderNumber: "PO-003",
    doctorName: "Dr. Emily Johnson",
    orderItems: [
      {
        id: "1",
        medicineName: "ARA-290 (16mg)",
        quantity: 2,
        price: 129.99,
        amount: "2 mg vial",
        image: "/images/products/p2.png",
      },
      {
        id: "2",
        medicineName: "BPC-157 (5mg)",
        quantity: 2,
        price: 59.99,
        amount: "5 mg vial",
        image: "/images/products/p5.png",
      },
    ],
    orderedOn: getOrderDate("Due in Three Days"),
    totalPrice: 379.96,
    status: "Ready for Pickup",
  },
  {
    id: "4",
    orderNumber: "PO-004",
    doctorName: "Dr. James Anderson",
    orderItems: [
      {
        id: "1",
        medicineName: "TB-500 (5mg)",
        quantity: 4,
        price: 74.99,
        amount: "5 mg vial",
        image: "/images/products/p3.png",
      },
    ],
    orderedOn: getOrderDate("Due This Week"),
    totalPrice: 299.96,
    status: "Delivered",
  },
  {
    id: "5",
    orderNumber: "PO-005",
    doctorName: "Dr. Sarah Wilson",
    orderItems: [
      {
        id: "1",
        medicineName: "2X Blend CJC-1295 / Ipamorelin (5mg)",
        quantity: 1,
        price: 89.99,
        amount: "5 mg vial",
        image: "/images/products/p1.png",
      },
      {
        id: "2",
        medicineName: "BPC-157 (5mg)",
        quantity: 2,
        price: 59.99,
        amount: "5 mg vial",
        image: "/images/products/p5.png",
      },
    ],
    orderedOn: getOrderDate("Due This Month"),
    totalPrice: 209.97,
    status: "Processing",
  },
  {
    id: "6",
    orderNumber: "PO-006",
    doctorName: "Dr. Michael Adams",
    orderItems: [
      {
        id: "1",
        medicineName: "ARA-290 (16mg)",
        quantity: 3,
        price: 129.99,
        amount: "2 mg vial",
        image: "/images/products/p4.png",
      },
    ],
    orderedOn: getOrderDate("Due in Three Days"),
    totalPrice: 389.97,
    status: "Delivered",
  },
  {
    id: "7",
    orderNumber: "PO-007",
    doctorName: "Dr. Emily Johnson",
    orderItems: [
      {
        id: "1",
        medicineName: "BPC-157 (5mg)",
        quantity: 1,
        price: 59.99,
        amount: "5 mg vial",
        image: "/images/products/p5.png",
      },
      {
        id: "2",
        medicineName: "2X Blend CJC-1295 / Ipamorelin (5mg)",
        quantity: 2,
        price: 89.99,
        amount: "5 mg vial",
        image: "/images/products/p4.png",
      },
    ],
    orderedOn: getOrderDate("Due Tomorrow"),
    totalPrice: 239.97,
    status: "Ready for Pickup",
  },
  {
    id: "8",
    orderNumber: "PO-008",
    doctorName: "Dr. James Anderson",
    orderItems: [
      {
        id: "1",
        medicineName: "TB-500 (5mg)",
        quantity: 2,
        price: 74.99,
        amount: "5 mg vial",
        image: "/images/products/p6.png",
      },
      {
        id: "2",
        medicineName: "ARA-290 (16mg)",
        quantity: 1,
        price: 129.99,
        amount: "2 mg vial",
        image: "/images/products/p2.png",
      },
    ],
    orderedOn: getOrderDate("Due This Week"),
    totalPrice: 279.97,
    status: "Processing",
  },
  // ---------------- add more dummy data ----------------
  ...Array.from({ length: 22 }, (_, i) => {
    const id = i + 9;
    const doctors = ["Dr. Sarah Wilson", "Dr. Michael Adams", "Dr. Emily Johnson", "Dr. James Anderson"];
    const statuses = ["Delivered", "Processing", "Ready for Pickup"];
    const dueDates = ["Due Today", "Due Tomorrow", "Due in Three Days", "Due This Week", "Due This Month"];

    return {
      id: String(id),
      orderNumber: `PO-${String(id).padStart(3, "0")}`,
      doctorName: doctors[i % doctors.length],
      orderItems: [
        {
          id: "1",
          medicineName: ["2X Blend CJC-1295 / Ipamorelin (5mg)", "BPC-157 (5mg)", "TB-500 (5mg)", "ARA-290 (16mg)"][
            i % 4
          ],
          quantity: (i % 3) + 1,
          price: [89.99, 59.99, 74.99, 129.99][i % 4],
          amount: "5 mg vial",
          image: [`/images/products/p1.png`, `/images/products/p2.png`, `/images/products/p3.png`, `/images/products/p5.png`][i % 4],
        },
        {
          id: "2",
          medicineName: ["TB-500 (5mg)", "BPC-157 (5mg)", "2X Blend CJC-1295 / Ipamorelin (5mg)", "ARA-290 (16mg)"][
            (i + 1) % 4
          ],
          quantity: ((i + 1) % 2) + 1,
          price: [74.99, 59.99, 89.99, 129.99][(i + 1) % 4],
          amount: "5 mg vial",
          image: [`/images/products/p6.png`, `/images/products/p5.png`, `/images/products/p4.png`, `/images/products/p2.png`][(i + 1) % 4],
        },
      ],
      orderedOn: getOrderDate(dueDates[i % dueDates.length]),
      totalPrice:
        ([89.99, 59.99, 74.99, 129.99][i % 4] * ((i % 3) + 1)) +
        ([74.99, 59.99, 89.99, 129.99][(i + 1) % 4] * (((i + 1) % 2) + 1)),
      status: statuses[i % statuses.length],
    };
  }),
];
