import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, Building, Calendar as CalendarIcon, Trash2, Edit, Check, X, AlertCircle } from 'lucide-react';

// Utility function
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Alert component
const Alert = ({ children, className, variant = 'default', ...props }) => (
  <div className={cn(
    "relative w-full rounded-lg border p-4",
    variant === 'destructive' ? 'border-red-600 text-red-600' : 'border-blue-600 text-blue-600',
    className
  )} role="alert" {...props}>
    {children}
  </div>
);

const AlertTitle = ({ children, className, ...props }) => (
  <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>
    {children}
  </h5>
);

const AlertDescription = ({ children, className, ...props }) => (
  <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props}>
    {children}
  </div>
);

// Button component
const Button = ({ children, className, ...props }) => (
  <button
    className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2", className)}
    {...props}
  >
    {children}
  </button>
);

// Card components
const Card = ({ children, className, ...props }) => (
  <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

// Input component
const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
    ref={ref}
    {...props}
  />
));

// Label component
const Label = ({ children, className, ...props }) => (
  <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>
    {children}
  </label>
);

// Main DonationCalendar component
const DonationCalendar = () => {
  const [donations, setDonations] = useState([]);
  const [organization, setOrganization] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [alertMessage, setAlertMessage] = useState('');

  const addDonation = () => {
    if (!organization || !amount || !startDate || !endDate) {
      setAlertMessage('Please fill in all fields');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setAlertMessage('Start date cannot be after end date');
      return;
    }

    const newDonation = {
      organization,
      amount: parseFloat(amount),
      startDate: start,
      endDate: end,
    };

    setDonations([...donations, newDonation]);
    setOrganization('');
    setAmount('');
    setStartDate('');
    setEndDate('');
    setAlertMessage('Donation added successfully!');
  };

  const deleteDonation = (index) => {
    const newDonations = [...donations];
    newDonations.splice(index, 1);
    setDonations(newDonations);
    setAlertMessage('Donation deleted successfully!');
  };

  const startEditing = (index) => {
    setEditingIndex(index);
    const donation = donations[index];
    setOrganization(donation.organization);
    setAmount(donation.amount.toString());
    setStartDate(donation.startDate.toISOString().split('T')[0]);
    setEndDate(donation.endDate.toISOString().split('T')[0]);
  };

  const saveEdit = () => {
    if (editingIndex !== -1) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setAlertMessage('Start date cannot be after end date');
        return;
      }

      const newDonations = [...donations];
      newDonations[editingIndex] = {
        organization,
        amount: parseFloat(amount),
        startDate: start,
        endDate: end,
      };
      setDonations(newDonations);
      setEditingIndex(-1);
      setOrganization('');
      setAmount('');
      setStartDate('');
      setEndDate('');
      setAlertMessage('Donation updated successfully!');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setOrganization('');
    setAmount('');
    setStartDate('');
    setEndDate('');
  };

  const clearAlert = () => setAlertMessage('');

  const chartData = useMemo(() => {
    if (donations.length === 0) return [];

    const allDates = donations.flatMap(d => [d.startDate, d.endDate]);
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    const months = [];
    for (let d = new Date(minDate.getFullYear(), minDate.getMonth(), 1); 
         d <= maxDate; 
         d.setMonth(d.getMonth() + 1)) {
      const monthData = { date: new Date(d) };
      donations.forEach((donation, index) => {
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        if (donation.startDate <= endOfMonth && donation.endDate >= startOfMonth) {
          monthData[`donation${index}`] = donation.amount;
          monthData[`org${index}`] = donation.organization;
        }
      });
      months.push(monthData);
    }

    return months;
  }, [donations]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatYAxis = (value) => `$${value.toFixed(0)}`;

  const totalDonations = useMemo(() => {
    return donations.reduce((sum, donation) => sum + donation.amount, 0);
  }, [donations]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          <Calendar className="inline-block mr-2 mb-1" /> Donation Calendar
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">${totalDonations.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Number of Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{donations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Avg. Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                ${donations.length ? (totalDonations / donations.length).toFixed(2) : '0.00'}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {alertMessage && (
          <Alert className="mb-4" variant={alertMessage.includes('successfully') ? 'default' : 'destructive'}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {alertMessage.includes('successfully') ? 'Success' : 'Error'}
            </AlertTitle>
            <AlertDescription>{alertMessage}</AlertDescription>
            <button
              onClick={clearAlert}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingIndex === -1 ? 'Add New Donation' : 'Edit Donation'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization" className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Organization
                </Label>
                <Input
                  id="organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Enter organization name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter donation amount"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            {editingIndex === -1 ? (
              <Button onClick={addDonation} className="bg-blue-500 hover:bg-blue-600 mt-4 w-full">Add Donation</Button>
            ) : (
              <div className="flex justify-between mt-4">
                <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                <Button onClick={cancelEdit} className="bg-gray-600 hover:bg-gray-700">Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation List Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Donation List</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <Alert>
                <AlertTitle>No donations yet</AlertTitle>
                <AlertDescription>Add a donation to see it in the list.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {donations.map((donation, index) => (
                  <Card key={index} className="bg-white hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between h-full py-4 px-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-full flex items-center justify-center">
                            <Building className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{donation.organization}</h3>
                            <p className="text-sm text-gray-600">
                              {donation.startDate.toLocaleDateString()} - {donation.endDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-green-600">${donation.amount.toFixed(2)}</span>
                          {editingIndex === index ? (
                            <>
                              <button onClick={saveEdit} className="p-1 bg-green-100 rounded-full hover:bg-green-200 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600" />
                              </button>
                              <button onClick={cancelEdit} className="p-1 bg-red-100 rounded-full hover:bg-red-200 flex items-center justify-center">
                              <X className="w-5 h-5 text-red-600" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEditing(index)} className="p-1 bg-yellow-100 rounded-full hover:bg-yellow-200 flex items-center justify-center">
                                <Edit className="w-5 h-5 text-yellow-600" />
                              </button>
                              <button onClick={() => deleteDonation(index)} className="p-1 bg-red-100 rounded-full hover:bg-red-200 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation Overview Chart */}
        {chartData.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Donation Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis tickFormatter={formatYAxis} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const totalFunds = payload.reduce((sum, entry) => sum + entry.value, 0);
                        return (
                          <div className="bg-white p-4 border rounded shadow-lg">
                            <p className="font-bold text-lg mb-2">{formatDate(label)}</p>
                            {payload.map((entry, index) => (
                              <p key={index} className="text-sm">
                                <span className="font-semibold">{entry.payload[`org${entry.dataKey.slice(-1)}`]}:</span> ${entry.value.toFixed(2)}
                              </p>
                            ))}
                            <p className="font-bold mt-2 text-lg">Total: ${totalFunds.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {donations.map((_, index) => (
                    <Bar 
                      key={index} 
                      dataKey={`donation${index}`} 
                      stackId="a" 
                      fill={`hsl(${index * 137.5 % 360}, 70%, 50%)`}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertTitle>No donations yet</AlertTitle>
            <AlertDescription>Add a donation to see it displayed on the calendar.</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Footer */}

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold">Donation Calendar</h2>
            <p className="text-gray-400 mt-2">Empowering non-profits with better tools</p>
            <a 
              href="https://nfptoolkit.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 text-white hover:text-blue-300 transition duration-150 ease-in-out"
            >
              Visit NFP Toolkit
            </a>
            <div className="mt-6 text-gray-400 text-sm">
              © {new Date().getFullYear()} Donation Calendar. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DonationCalendar;