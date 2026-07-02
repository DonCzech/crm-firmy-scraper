import { gql } from 'graphql-request';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) { accessToken refreshToken }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) { accessToken refreshToken }
  }
`;

export const REFRESH = gql`
  mutation Refresh($token: String!) {
    refresh(token: $token) { accessToken refreshToken }
  }
`;

export const LOGOUT = gql`
  mutation Logout($token: String!) {
    logout(token: $token)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token)
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password)
  }
`;

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingGqlInput!) {
    createListing(input: $input) { id slug status }
  }
`;

export const UPDATE_LISTING = gql`
  mutation UpdateListing($id: String!, $input: CreateListingGqlInput!) {
    updateListing(id: $id, input: $input) { id slug status title price city }
  }
`;

export const PUBLISH_LISTING = gql`
  mutation PublishListing($id: String!) {
    publishListing(id: $id) { id status }
  }
`;

export const ARCHIVE_LISTING = gql`
  mutation ArchiveListing($id: String!) {
    archiveListing(id: $id) { id status }
  }
`;

export const UPLOAD_LISTING_MEDIA = gql`
  mutation UploadListingMedia($listingId: String!, $mimeType: String!) {
    uploadListingMedia(listingId: $listingId, mimeType: $mimeType) { key url }
  }
`;

export const CONFIRM_LISTING_MEDIA = gql`
  mutation ConfirmListingMedia($listingId: String!, $key: String!, $mimeType: String!, $size: Int!) {
    confirmListingMedia(listingId: $listingId, key: $key, mimeType: $mimeType, size: $size)
  }
`;

export const REORDER_LISTING_MEDIA = gql`
  mutation ReorderListingMedia($listingId: String!, $orderedIds: [String!]!) {
    reorderListingMedia(listingId: $listingId, orderedIds: $orderedIds)
  }
`;

export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($listingId: String!) {
    toggleFavorite(listingId: $listingId)
  }
`;

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($recipientId: String!, $listingId: String!, $message: String!) {
    createConversation(recipientId: $recipientId, listingId: $listingId, message: $message) { id }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: String!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) { id content createdAt }
  }
`;

export const CREATE_WATCHDOG = gql`
  mutation CreateWatchdog($input: WatchdogInput!) {
    createWatchdog(input: $input) { id name active }
  }
`;

export const UPDATE_WATCHDOG = gql`
  mutation UpdateWatchdog($id: String!, $input: WatchdogInput!) {
    updateWatchdog(id: $id, input: $input) { id }
  }
`;

export const DELETE_WATCHDOG = gql`
  mutation DeleteWatchdog($id: String!) {
    deleteWatchdog(id: $id)
  }
`;

export const START_SUBSCRIPTION = gql`
  mutation StartSubscription($tier: SubscriptionTier!) {
    startSubscription(tier: $tier) { checkoutUrl }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription
  }
`;

export const PURCHASE_BOOST = gql`
  mutation PurchaseBoost($listingId: String!, $type: BoostType!) {
    purchaseBoost(listingId: $listingId, type: $type) { checkoutUrl }
  }
`;

export const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead($ids: [String!]!) {
    markNotificationsRead(ids: $ids)
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllRead {
    markAllNotificationsRead
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id firstName lastName phone avatarUrl bio }
  }
`;

export const ADMIN_APPROVE = gql`
  mutation AdminApproveListing($id: String!) {
    adminApproveListing(id: $id)
  }
`;

export const ADMIN_REJECT = gql`
  mutation AdminRejectListing($id: String!, $reason: String!) {
    adminRejectListing(id: $id, reason: $reason)
  }
`;

export const CREATE_INQUIRY = gql`
  mutation CreateInquiry($input: CreateInquiryInput!) {
    createInquiry(input: $input) { id senderName createdAt }
  }
`;

export const MARK_INQUIRY_READ = gql`
  mutation MarkInquiryRead($id: String!) {
    markInquiryRead(id: $id)
  }
`;
