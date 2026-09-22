import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({
  icon,
  title,
  description,
  loading = false,
}) {

  if (loading) {
    return (
      <div className="bg-white rounded-[30px] p-8 border border-slate-100 card-shadow animate-pulse">
        <div className="w-16 h-16 rounded-[22px] bg-slate-200 mb-6"></div>

        <div className="h-8 bg-slate-200 rounded mb-4"></div>

        <div className="space-y-3">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-11/12"></div>
          <div className="h-4 bg-slate-200 rounded w-8/12"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-[30px] border border-[#F1DDD1] bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-[#D7A384] hover:shadow-xl hover:shadow-[#F1DDD1]">

      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#F1DDD1] to-[#F1DDD1] text-[#A45F35] transition duration-300 group-hover:scale-110 group-hover:bg-[#A45F35] group-hover:text-white">

        {icon}

      </div>

      {/* Title */}
      <h3 className="mb-4 text-2xl font-semibold text-slate-900">

        {title}

      </h3>

      {/* Description */}
      <p className="leading-7 text-slate-600">

        {description}

      </p>

    </div>
  );
}