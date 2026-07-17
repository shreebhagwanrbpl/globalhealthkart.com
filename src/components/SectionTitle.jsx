export default function SectionTitle({
  badge,
  title,
  description,
  center = false,
}) {
  return (
    <div
      className={`${center ? "mx-auto text-center" : ""
        } max-w-3xl`}
    >

      {/* Badge */}
      {badge && (
        <div className="mb-5 inline-flex items-center rounded-full border border-green-200 bg-green-100 px-5 py-2 text-sm font-semibold text-green-700 shadow-sm">
          {badge}
        </div>
      )}

      {/* Title */}
      <h2 className="section-title text-slate-900">
        {title}
      </h2>

      {/* Description */}
      <p className="section-subtitle mt-4 text-slate-600">
        {description}
      </p>

    </div>
  );
}