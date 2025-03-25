
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const SignaturePad: React.FC = () => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    setImageURL(null);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast({
        title: "Empty Signature",
        description: "Please create a signature before saving.",
        variant: "destructive",
      });
      return;
    }
    
    const dataURL = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    setImageURL(dataURL || null);
    
    toast({
      title: "Success!",
      description: "Your signature has been saved.",
    });
  };

  const download = () => {
    if (!imageURL) {
      toast({
        title: "No Signature",
        description: "Please save your signature first.",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = 'signature.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Signature App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-300 rounded-md">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: "signature-canvas w-full h-64 bg-white",
              }}
              backgroundColor="white"
            />
          </div>
          
          {imageURL && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="border border-gray-200 p-4 rounded-md bg-white">
                <img src={imageURL} alt="signature" className="mx-auto" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={clear}>
            Clear
          </Button>
          <Button variant="secondary" onClick={save}>
            Save
          </Button>
          <Button onClick={download} disabled={!imageURL}>
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignaturePad;
