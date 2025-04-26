import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Tooltip,
} from "@material-tailwind/react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { toast } from "sonner";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { apiRoutes } from "../utils/apiRoutes";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function VisitingSpecialist() {
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    availableTime: "",
    availableDays: [],
    contactNumber: "",
    email: "",
  });

  const fetchSpecialists = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiRoutes.VisitingSpecialist, {
        withCredentials: true,
      });
      
      if (response.data.ok) {
        setSpecialists(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch specialists");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch specialists");
      console.error("Error fetching specialists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      specialization: "",
      availableTime: "",
      availableDays: [],
      contactNumber: "",
      email: "",
    });
    setOpenAdd(true);
  };

  const handleOpenEdit = (specialist) => {
    setSelectedSpecialist(specialist);
    setFormData({
      name: specialist.name,
      specialization: specialist.specialization,
      availableTime: specialist.availableTime,
      availableDays: specialist.availableDays,
      contactNumber: specialist.contactNumber,
      email: specialist.email,
    });
    setOpenEdit(true);
  };

  const handleOpenDelete = (specialist) => {
    setSelectedSpecialist(specialist);
    setOpenDelete(true);
  };

  const handleCloseDialogs = () => {
    setOpenAdd(false);
    setOpenEdit(false);
    setOpenDelete(false);
    setSelectedSpecialist(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDaySelect = (day) => {
    setFormData((prev) => {
      if (prev.availableDays.includes(day)) {
        return {
          ...prev,
          availableDays: prev.availableDays.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          availableDays: [...prev.availableDays, day],
        };
      }
    });
  };

  const handleAddSpecialist = async () => {
    try {
      setLoading(true);
      const response = await axios.post(apiRoutes.VisitingSpecialist, formData, {
        withCredentials: true,
      });
      
      if (response.data.ok) {
        toast.success(response.data.message || "Specialist added successfully");
        handleCloseDialogs();
        await fetchSpecialists();
      } else {
        toast.error(response.data.message || "Failed to add specialist");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add specialist");
      console.error("Error adding specialist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSpecialist = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${apiRoutes.VisitingSpecialist}/${selectedSpecialist.id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      
      if (response.data.ok) {
        toast.success(response.data.message || "Specialist updated successfully");
        handleCloseDialogs();
        await fetchSpecialists();
      } else {
        toast.error(response.data.message || "Failed to update specialist");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update specialist");
      console.error("Error updating specialist:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialist = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${apiRoutes.VisitingSpecialist}/${selectedSpecialist.id}`,
        {
          withCredentials: true,
        }
      );
      
      if (response.data.ok) {
        toast.success(response.data.message || "Specialist deleted successfully");
        handleCloseDialogs();
        await fetchSpecialists();
      } else {
        toast.error(response.data.message || "Failed to delete specialist");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete specialist");
      console.error("Error deleting specialist:", error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.name &&
      formData.specialization &&
      formData.availableTime &&
      formData.availableDays.length > 0 &&
      formData.contactNumber
    );
  };

  const renderDaysSelection = () => {
    return (
      <div className="flex flex-col gap-2">
        <Typography variant="h6" color="blue-gray">
          Available Days
        </Typography>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <Button
              key={day}
              variant={formData.availableDays.includes(day) ? "filled" : "outlined"}
              color={formData.availableDays.includes(day) ? "blue" : "blue-gray"}
              size="sm"
              onClick={() => handleDaySelect(day)}
              className="normal-case"
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderSpecialistForm = () => {
    return (
      <>
        <div className="mb-4">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="Available Time"
            name="availableTime"
            value={formData.availableTime}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          {renderDaysSelection()}
        </div>
        <div className="mb-4">
          <Input
            label="Contact Number"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h3" color="blue-gray">
            Visiting Specialists
          </Typography>
          <Button
            onClick={handleOpenAdd}
            className="flex items-center gap-2"
            color="blue"
          >
            <PlusIcon className="h-5 w-5" />
            Add Specialist
          </Button>
        </div>

        {loading ? (
          <SyncLoadingScreen />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialists.length > 0 ? (
              specialists.map((specialist) => (
                <Card key={specialist.id} className="overflow-hidden">
                  <CardHeader
                    floated={false}
                    shadow={false}
                    color="blue"
                    className="m-0 p-4 flex justify-between items-center"
                  >
                    <Typography variant="h5" color="white">
                      Dr. {specialist.name}
                    </Typography>
                    <div className="flex gap-2">
                      <Tooltip content="Edit Specialist">
                        <IconButton
                          variant="text"
                          color="white"
                          onClick={() => handleOpenEdit(specialist)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete Specialist">
                        <IconButton
                          variant="text"
                          color="white"
                          onClick={() => handleOpenDelete(specialist)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2">
                      <Typography variant="h6">{specialist.specialization}</Typography>
                      <Typography variant="paragraph">
                        <span className="font-semibold">Available:</span>{" "}
                        {Array.isArray(specialist.availableDays) 
                          ? specialist.availableDays.join(", ") 
                          : specialist.availableDays} at {specialist.availableTime}
                      </Typography>
                      <Typography variant="paragraph">
                        <span className="font-semibold">Contact:</span>{" "}
                        {specialist.contactNumber}
                      </Typography>
                      {specialist.email && (
                        <Typography variant="paragraph">
                          <span className="font-semibold">Email:</span> {specialist.email}
                        </Typography>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <Typography variant="h5" color="blue-gray">
                  No specialists found
                </Typography>
                <Typography color="gray" className="mt-2">
                  Add a new specialist to get started
                </Typography>
              </div>
            )}
          </div>
        )}

        {/* Add Specialist Dialog */}
        <Dialog open={openAdd} handler={handleCloseDialogs} size="md">
          <DialogHeader>Add New Specialist</DialogHeader>
          <DialogBody divider>{renderSpecialistForm()}</DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialogs}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              color="blue" 
              onClick={handleAddSpecialist}
              disabled={!isFormValid() || loading}
            >
              {loading ? "Adding..." : "Add Specialist"}
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Edit Specialist Dialog */}
        <Dialog open={openEdit} handler={handleCloseDialogs} size="md">
          <DialogHeader>Edit Specialist</DialogHeader>
          <DialogBody divider>{renderSpecialistForm()}</DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="red"
              onClick={handleCloseDialogs}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              color="blue" 
              onClick={handleEditSpecialist}
              disabled={!isFormValid() || loading}
            >
              {loading ? "Updating..." : "Update Specialist"}
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDelete} handler={handleCloseDialogs} size="sm">
          <DialogHeader>Confirm Deletion</DialogHeader>
          <DialogBody divider>
            <Typography color="gray">
              Are you sure you want to delete Dr.{" "}
              <span className="font-bold">{selectedSpecialist?.name}</span>? This action
              cannot be undone.
            </Typography>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="text"
              color="blue-gray"
              onClick={handleCloseDialogs}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleDeleteSpecialist}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </Dialog>
      </div>
    </Layout>
  );
}