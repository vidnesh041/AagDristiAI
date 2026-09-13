import ReportClient from "./ReportClient";

export const metadata = {
  title: "Report Hazard — AAG Drishti AI",
  description: "Submit road inundation and potholes with Hugging Face AI Computer Vision verification.",
};

export default function ReportPage() {
  return <ReportClient />;
}
