import ReportClient from "./ReportClient";

export const metadata = {
  title: "Report Hazard — NagDrishtiAI",
  description: "Submit road inundation and potholes with Hugging Face AI Computer Vision verification.",
};

export default function ReportPage() {
  return <ReportClient />;
}
