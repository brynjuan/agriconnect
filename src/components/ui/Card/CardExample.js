import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './index';

const CardExample = () => {
  return (
    <div className="p-4 space-y-6">
      {/* Basic Card example */}
      <Card>
        <CardHeader title="Basic Card" subtitle="With title and subtitle" />
        <CardContent>
          <p>This is a basic card with a header, content, and footer.</p>
          <p className="mt-2">You can add any content here.</p>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
              Submit
            </button>
          </div>
        </CardFooter>
      </Card>

      {/* Card with custom header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Custom Header</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p>This card has a custom header with a close button.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition">
            Cancel
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Save
          </button>
        </CardFooter>
      </Card>

      {/* Card without footer */}
      <Card>
        <CardHeader title="No Footer" subtitle="This card doesn't have a footer" />
        <CardContent>
          <p>You can use any combination of CardHeader, CardContent, and CardFooter.</p>
        </CardContent>
      </Card>

      {/* Card with only content */}
      <Card>
        <CardContent>
          <p>This is a simple card with only content and no header or footer.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardExample; 