
import SignaturePad from "@/components/SignaturePad";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Signature App</h1>
          <p className="mt-3 text-xl text-gray-500">Create, save, and download your digital signature</p>
        </div>
        <SignaturePad />
      </div>
    </div>
  );
};

export default Index;
