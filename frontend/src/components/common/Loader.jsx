const Loader = ({ label = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
};

export default Loader;
