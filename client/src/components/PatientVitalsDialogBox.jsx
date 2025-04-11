import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
  } from "@material-tailwind/react";

export default function PatientVitalsDialogBox({
    type = "id",
    title,
    open,
    setOpen,
    handleDelete,
    deletedRecordId = "",
    setDeletedRecordId = ()=>{},
  }) {
    const handleDialogResponse = () => {
      setOpen(false);
      setDeletedRecordId(null);
    };
  
    return (
      <>
        <Dialog open={open}>
          <DialogHeader className="text-1xl">
            {`Are you sure you want to delete this patient vital record ?`}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="text"
              color="green"
              onClick={() => handleDialogResponse()}
              className="mr-1"
            >
              <span>Cancel</span>
            </Button>
            <Button
              variant="gradient"
              onClick={(e) => {
                (type === "id") ? handleDelete(e, deletedRecordId) : handleDelete();
                setOpen(false);
              }}
            >
              <span>Confirm</span>
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  }