import { useSelector } from "react-redux";
import ComplaintCard from "../../components/ComplainCard";
import { useGetMyComplaintsQuery } from "../../redux/api/api";

const Complaints = () => {
  const { user } = useSelector((state) => state.auth);
  if (!user)
    return <div className="flex min-h-[50vh] items-center justify-center bg-white text-slate-600">Please log in to view your complaints.</div>;
  // console.log(user);
  const {
    data: complaints,
    error,
    isLoading,
  } = useGetMyComplaintsQuery(user.token);
  // console.log(complaints);

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center bg-white text-slate-600">Loading your reports...</div>;
  if (error)
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white text-red-600">
        Error fetching complaints
      </div>
    );

  return (
    <div className="min-h-[70vh] bg-white px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">Your activity</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">My complaints</h1>
          <p className="mt-3 text-slate-500">Track every report you&apos;ve sent to the city.</p>
        </div>
        {complaints?.length ? (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
            {complaints.map((complaint) => <ComplaintCard key={complaint._id} complaint={complaint} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center text-slate-500">
            You haven&apos;t submitted a complaint yet.
          </div>
        )}
      </div>
    </div>
  );
};
export default Complaints;
