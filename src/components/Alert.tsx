import { useEffect, useState } from "react";

type AlertProps = {
    state?: any;
}

const Alert = ({ state }: AlertProps) => {

    const [showAlert, setShowAlert] = useState(false);
    const [alertDisplay, setAlertDisplay] = useState("none");
    const [alertClass, setAlertClass] = useState<string | null>();
    const [alertMessage, setAlertMessage] = useState<string | null>();
    const [alertType, setAlertType] = useState<string | null>();

    const setAlert = () => {

        if(typeof state !== 'undefined' || localStorage.getItem('alert-message') != null)
        {
            const message = typeof state !== 'undefined' ? state.alertMessage : localStorage.getItem('alert-message');
            const type = typeof state !== 'undefined' ? state.alertType : localStorage.getItem('alert-type');

            setAlertType(type);
            setAlertMessage(message);
            setShowAlert(true);
            
            setTimeout(function () {
                setAlertDisplay("block");
                setAlertClass('show');
            }, 500);
            
            setTimeout(function () {
                setAlertClass('');
            }, 5000);
            
            setTimeout(function () {
              setAlertDisplay("none");
            }, 5500);

            localStorage.removeItem('alert-message');
            localStorage.removeItem('alert-type');
        }
    }

    useEffect(() => {
        setAlert();
    }, [setAlert]);

    useEffect(() => {
        setAlert();
    }, [localStorage.getItem('alert-message')]);

    return (
        <div>
            {showAlert ?
            <div 
                className={`alert ${alertType} alert-dismissible fade alert-message ${alertClass}`}
                style={{ display: alertDisplay }}>
                <button 
                    type="button" 
                    className="close" 
                    data-dismiss="alert" 
                    aria-label="Close"
                    onClick={() => setAlertDisplay("none")}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
                {alertMessage}
            </div> : <div></div>
            }
        </div>
    );
}

export default Alert;