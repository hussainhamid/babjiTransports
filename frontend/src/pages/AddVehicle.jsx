import VehicleForm from "../components/vehicleForm/VehicleForm";

const AddVehicle = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold">List Your Vehicle</h1>

          <p className="mt-4 text-lg text-blue-100 max-w-2xl">
            Join Babji Transports and start receiving bookings from customers in
            your city.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <VehicleForm />
      </div>
    </div>
  );
};

export default AddVehicle;
