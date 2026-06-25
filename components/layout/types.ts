export type AccessType = "demo" | "paid";

export type PaymentType = "full" | "emi";

export type ClassRecord = {
  key: string;
  className: string;
  subjects?: string[];
  bannerFileName?: string;
  accessType: AccessType;
  paymentType?: PaymentType;
  price?: number;
  strikePrice?: number;
  validityMonths?: number;
  installments?: number;
};

export type VideoPart = {
  installment: number;
  title: string;
};

export type VideoRecord = {
  key: string;
  classKey: string;
  className: string;
  subject: string;
  chapterName?: string;
  topicName?: string;
  videoName: string;
  videoFileName?: string;
  description: string;
  parts: VideoPart[];
};
