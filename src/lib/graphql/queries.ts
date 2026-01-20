import { userpayload } from "@/lib/graphql/attributes";
import { gql } from "@apollo/client";

export const ALL_DOCTORS = gql`
  query AllDoctors($pendingInvites: Boolean, $status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allDoctors(pendingInvites: $pendingInvites, status: $status, search: $search, page: $page, perPage: $perPage) {
      allData {
       ${userpayload}
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;

export const FETCH_USER = gql`
  query FetchUser {
    fetchUser {
      user {
        ${userpayload}
      }
    }
  }
`;
export const ALL_PATIENTS = gql`
  query allPatients($pendingInvites: Boolean,$status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allPatients(pendingInvites: $pendingInvites, status: $status, search: $search, page: $page, perPage: $perPage) {
      allData {
       ${userpayload}
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const ALL_ADMINS = gql`
  query AllAdmins($pendingInvites: Boolean, $status: UserStatusEnum $search: String, $page: Int, $perPage: Int) {
    allAdmins(pendingInvites: $pendingInvites, status: $status, search: $search, page: $page, perPage: $perPage) {
      allData {
       ${userpayload}
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const ALL_PRODUCTS = gql`
  query AllProducts {
    allProducts(inStockOnly: true) {
      allData {
        id
        title
        variants {
          price
          id
          shopifyVariantId
        }
      }
    }
  }
`;
export const ALL_PRODUCTS_INVENTORY = gql`
  query AllProducts(
    $search: String
    $page: Int
    $perPage: Int
    $inStockOnly: Boolean
    $category: String
    $favoriteProducts: Boolean
    $patientId: ID
    $markedUp: Boolean
    $notMarkedUp: Boolean
  ) {
    allProducts(
      search: $search
      page: $page
      perPage: $perPage
      inStockOnly: $inStockOnly
      category: $category
      favoriteProducts: $favoriteProducts
      patientId: $patientId
      markedUp: $markedUp
      notMarkedUp: $notMarkedUp
    ) {
      allData {
        customPrice
        customPriceChangeHistory {
          customPrice
          id
          createdAt
        }
        description
        handle
        id
        images
        inStock
        isFavorited
        priceRange
        primaryImage
        productType
        shopifyId
        title
        totalInventory
        vendor
        tags
        variants {
          price
          id
          shopifyVariantId
          sku
        }
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const DOCTOR_ORDERS = gql`
  query DoctorOrders($status: String, $page: Int, $perPage: Int, $myClinic: Boolean) {
    doctorOrders(status: $status, page: $page, perPage: $perPage, myClinic: $myClinic) {
      allData {
        id
        displayId
        patient {
         ${userpayload}
        }
        createdAt
        status
        orderItems {
          id
          quantity
          price
          product {
            title
          }
        }
        totalPrice
        profit
        netCost
        subtotalPrice
        totalTax
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;
export const FETCH_CUSTOMER = gql`
  query FetchUser($id: ID!) {
    fetchUser(id: $id) {
      user {
        ${userpayload}
      }
    }
  }
`;

export const FETCH_ORDER = gql`
  query FetchOrder($id: ID!) {
    fetchOrder(id: $id) {
      id
      displayId
      createdAt
      status
      subtotalPrice
      totalPrice
      trackingNumber
      totalTax
      patient {
        ${userpayload}
      }
      orderItems {
        id
        quantity
        price
        totalPrice
        product {
          id
          title
          variants {
            id
            price
            shopifyVariantId
          }
        }
      }
    }
  }
`;
export const FETCH_PRODUCT = gql`
  query FetchProduct($id: ID!) {
    fetchProduct(id: $id) {
      customPriceChangeHistory {
        customPrice
        id
        createdAt
      }
      markupPercentage
      customPrice
      description
      handle
      id
      images
      inStock
      isFavorited
      priceRange
      primaryImage
      productType
      shopifyId
      title
      totalInventory
      vendor
      price
      tags
      variants {
        price
        id
        shopifyVariantId
        sku
      }
    }
  }
`;
export const FETCH_ALL_MESSAGES = gql`
query FetchAllMessages($chatId: ID! $page: Int, $perPage: Int) {
    fetchAllMessages(chatId: $chatId, page: $page, perPage: $perPage) {
        allData {
            content
            id
            createdAt
            chat {
            id
            otherParticipant {
                ${userpayload}
            }
            }
            user {
                ${userpayload}
            }
        }
        count
        nextPage
        prevPage
        totalPages
    }
}
`;
export const FETCH_DOCTOR = gql`
  query FetchUser {
    fetchUser {
      user {
        doctor {
          ${userpayload}
        }
      }
    }
  }
`;
export const MESSAGE_ADDED = gql`
  subscription MessageAdded($chatId: ID!) {
    messageAdded(chatId: $chatId) {
      __typename
      content
      id
      messageType
      user {
        __typename
        ${userpayload}
      }
      sender {
        __typename
        ${userpayload}
      }
    }
  }
`;

export const PATIENT_ORDERS = gql`
  query PatientOrders(
    $patientId: ID
    $page: Int
    $perPage: Int
    $status: String
    $search: String
  ) {
    patientOrders(
      patientId: $patientId
      page: $page
      perPage: $perPage
      status: $status
      search: $search
    ) {
      allData {
        id
        displayId
        status
        createdAt
        totalPrice
        hasAnotherReorder
        totalTax
        subtotalPrice
        patient {
          address
        }
        doctor {
          ${userpayload}
        }
        orderItems {
          id
          quantity
          price
          totalPrice
          product {
            title
            description
            id
            images
            primaryImage
            tags
             variants {
              sku
            }
          }
        }
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;

export const ALL_ORDER_REQUESTS = gql`
  query AllOrderRequests(
    $search: String
    $patientId: ID
    $status: String
    $page: Int
    $perPage: Int
    $reorder: Boolean
  ) {
    allOrderRequests(
      search: $search
      patientId: $patientId
      status: $status
      page: $page
      perPage: $perPage
      reorder: $reorder
    ) {
      allData {
        displayId
        orderPaid
        id
        requestCustomPrice
        status
        doctorMessage
        reason
        order {
          id
           status
        }
        notes {
          content
          notableId
          notableType
          author {
              ${userpayload}
          }
        }
        doctor {
          ${userpayload}
        }
        patient {
          ${userpayload}
        }
        requestedItems {
          title
          price
          product {
            customPrice
            id
            title
            description
            productType
            vendor
          }
        }
      }
      dataCount
      nextPage
      prevPage
      totalPages
    }
  }
`;

export const FETCH_NOTES = gql`
  query FetchNotes($notableId: ID!) {
    fetchNotes(notableId: $notableId) {
      author {
        ${userpayload}
      }
      content
      notableId
      notableType
      id
      createdAt
    }
  }
`;

export const FETCH_NOTIFICATION_SETTINGS = gql`
  query NotificationSettings {
    notificationSettings {
      id
      emailNotification
      lowStockAlerts
      orderUpdates
      smsNotification
    }
  }
`;
export const ALL_NOTIFICATIONS = gql`
  query AllNotifications($page: Int, $perPage: Int) {
    allNotifications(page: $page, perPage: $perPage) {
      allData {
        date
        doctorName
        id
        notificationType
        notifiableId
        senderName
        productNames
        product {
          id
          name
        }
        read
        sender {
          id
        }
        message {
          content
        }
        orderRequest {
          id
          displayId
          status
          requestedItems {
            title
            price
            product {
              id
              title
              description
              primaryImage
              productType
              vendor
              tags
              variants {
                sku
              }
            }
          }
        }
        user {
          id
        }
      }
      dataCount
      nextPage
      prevPage
      totalPages
    }
  }
`;

export const ORDER_REMINDERS = gql`
  query OrderReminders($page: Int, $perPage: Int, $search: String) {
    orderReminders(page: $page, search: $search, perPage: $perPage) {
      allData {
        id
        
        createdAt
        daysSinceCreated
        autoReorder
        patient {
         ${userpayload}
        }
        orderItems {
          product {
            title
          }
        }
      }
      count
      nextPage
      prevPage
      totalPages
    }
  }
`;

export const DOCTOR_DASHBOARD = gql`
  query DoctorDashboard {
    doctorDashboard {
      ordersCount
      totalProfit
      totalSales
      averageOrderValue
    }
  }
`;

export const PAYMENT_INVOICES = gql`
  query PaymentInvoices($orderId: ID!) {
    paymentInvoices(orderId: $orderId) {
      amount
      orderId
      billingAddress
      status
      transactionId
      invoiceNumber
    }
  }
`;
export const ADMIN_DASHBOARD = gql`
  query AdminDashboard {
    adminDashboard {
      totalProductsSold
      totalDoctors
      salesAmountToday
      salesAmountThisMonth
      salesAmountPastMonth
      newDoctorsThisMonth
      inactiveDoctors
      activeDoctors
      topSellingProducts {
        productId
        productTitle
        salesCount
        salesPercentage
      }
      topPerformingDoctors {
        doctorName
        totalSalesAmount
        doctorEmail
      }
      newlyOnboardedDoctors {
        doctorEmail
        doctorId
        doctorName
        onboardedAt
      }
    }
  }
`;
export const ORDERS_GRAPH = gql`
  query OrdersGraph($period: OrdersGraphPeriodEnum!) {
    ordersGraph(period: $period) {
      period
      totalOrders

      dataPoints {
        date
        label
        ordersCount
      }
    }
  }
`;

export const REVENUE_GRAPH = gql`
  query RevenueGraph($period: OrdersGraphPeriodEnum!) {
    revenueGraph(period: $period) {
      dataPoints {
        date
        revenueAmount
        label
      }
      period
      totalRevenue
    }
  }
`;
