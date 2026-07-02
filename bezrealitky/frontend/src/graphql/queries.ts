import { gql } from 'graphql-request';

export const SEARCH_LISTINGS = gql`
  query SearchListings($filters: SearchFiltersInput, $pagination: PaginationInput, $sort: SortInput) {
    searchListings(filters: $filters, pagination: $pagination, sort: $sort) {
      items {
        id slug title price area rooms city district offerType estateType status viewCount createdAt publishedAt lat lon
        media { id url isCover }
      }
      total page limit pages
    }
  }
`;

export const GET_LISTING = gql`
  query GetListing($slug: String!) {
    listing(slug: $slug) {
      id slug title description price area floor totalFloors rooms furnished parking balcony cellar elevator petFriendly
      street city district region zip lat lon offerType estateType status viewCount contactCount createdAt publishedAt
      ownerId ownerPhone
      media { id url isCover order }
    }
  }
`;

export const GET_LISTING_BY_ID = gql`
  query GetListingById($id: String!) {
    listing(id: $id) {
      id slug title description price area floor totalFloors rooms furnished parking balcony cellar elevator petFriendly
      street city district region zip lat lon offerType estateType status viewCount contactCount createdAt publishedAt
      ownerId ownerPhone
      media { id url isCover order }
    }
  }
`;

export const MY_LISTINGS = gql`
  query MyListings {
    myListings {
      id slug title price status city offerType estateType createdAt publishedAt viewCount contactCount
      media { id url isCover }
    }
  }
`;

export const MY_FAVORITES = gql`
  query MyFavorites {
    myFavorites {
      id createdAt
      listing { id slug title price area city offerType estateType media { url isCover } }
    }
  }
`;

export const MY_CONVERSATIONS = gql`
  query MyConversations {
    myConversations {
      id participantAId participantBId participantAEmail participantBEmail participantAName participantBName participantAPhone participantBPhone listingId updatedAt
      messages { id content senderId createdAt status }
    }
  }
`;

export const CONVERSATION_MESSAGES = gql`
  query ConversationMessages($conversationId: String!) {
    conversationMessages(conversationId: $conversationId) {
      id content senderId status createdAt
    }
  }
`;

export const MY_WATCHDOGS = gql`
  query MyWatchdogs {
    myWatchdogs { id name offerType estateType city region priceMin priceMax rooms active createdAt }
  }
`;

export const MY_SUBSCRIPTION = gql`
  query MySubscription {
    mySubscription { id tier status currentPeriodEnd cancelAtPeriodEnd }
  }
`;

export const MY_NOTIFICATIONS = gql`
  query MyNotifications($unreadOnly: Boolean) {
    myNotifications(unreadOnly: $unreadOnly) { id type title body read createdAt }
  }
`;

export const UNREAD_COUNT = gql`
  query UnreadCount {
    unreadNotificationsCount
  }
`;

export const MY_PROFILE = gql`
  query MyProfile {
    myProfile { id firstName lastName phone avatarUrl bio isPremium }
  }
`;

export const ME = gql`
  query Me {
    me { id email emailVerified role createdAt }
  }
`;

export const MY_INQUIRIES = gql`
  query MyInquiries {
    myInquiries {
      id senderName senderEmail senderPhone message read createdAt
      listing { id title slug }
    }
  }
`;
