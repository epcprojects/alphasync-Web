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
    orderId: "ORD-014",
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
        medicineName: "ARA-290 (16mg) x 1",
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

