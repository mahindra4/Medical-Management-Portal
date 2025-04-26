import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { FaUserDoctor } from "react-icons/fa6";
import { apiRoutes } from "../utils/apiRoutes";

const VisitingSpecialistBanner = () => {
  const [specialists, setSpecialists] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodaySpecialists = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiRoutes.VisitingSpecialist}`, {
          withCredentials: true,
        });
        
        if (response.data.ok) {
          setSpecialists(response.data.data);
        } else {
          setError("Failed to fetch visiting specialists");
        }
      } catch (err) {
        console.error("Error fetching today's visiting specialists:", err);
        setError("Failed to fetch visiting specialists");
      } finally {
        setLoading(false);
      }
    };

    fetchTodaySpecialists();
  }, []);

  useEffect(() => {
    // Only set up rotation if there are multiple specialists
    if (specialists.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % specialists.length);
      }, 3000); // Rotate every 3 seconds

      return () => clearInterval(interval);
    }
  }, [specialists]);

  if (loading) {
    return (
      <Card className="mb-4 overflow-hidden">
        <CardBody className="p-4">
          <Typography variant="h6" color="white">
            Loading visiting specialists...
          </Typography>
        </CardBody>
      </Card>
    );
  }

  if (error || specialists.length === 0) {
    return (
      <Card className="mb-4 overflow-hidden">
        <CardBody className="p-4 flex flex-row items-center">
          <FaUserDoctor className="h-6 w-6 mr-3 text-blue-gray-500" />
          <Typography variant="h6" color="blue-gray">
            No visiting specialists today
          </Typography>
        </CardBody>
      </Card>
    );
  }

  const currentSpecialist = specialists[currentIndex];

  return (
    <Card className="mb-4 overflow-hidden bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 shadow-md">
      <CardBody className="p-6">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          {/* Specialist image or icon */}
          {currentSpecialist.imageUrl ? (
            <img
              src={currentSpecialist.imageUrl}
              alt={`Dr. ${currentSpecialist.name}`}
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-gray-200"
            />
          ) : (
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-gray-200 text-white text-2xl">
              <FaUserDoctor />
            </div>
          )}
  
          {/* Specialist info */}
          <div>
            <Typography variant="h6" color="blue-gray" className="font-bold">
              Today's Visiting Specialist
            </Typography>
            <Typography variant="lead" className="text-lg font-semibold text-blue-gray-800">
              Dr. {currentSpecialist.name}
            </Typography>
            <Typography className="text-sm text-blue-gray-700">
              <span className="font-medium">Specialization:</span> {currentSpecialist.specialization}
            </Typography>
            <Typography className="text-sm text-blue-gray-700">
              <span className="font-medium">Available Time:</span> {currentSpecialist.availableTime}
            </Typography>
          </div>
  
          {/* Dot indicators */}
          {specialists.length > 1 && (
            <div className="flex gap-2 mt-2 justify-center">
              {specialists.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-blue-gray-800 scale-125' : 'bg-blue-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
  
  
  
};

export default VisitingSpecialistBanner;