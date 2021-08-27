import { Tab, Tabs } from "react-bootstrap";
import Alert from "../components/Alert";
import AddressStoreComponent from "../components/screens/AddressStoreComponent";
import DeliveryTaxComponent from "../components/screens/DeliveryTaxComponent";
import StoreComponent from "../components/screens/StoreComponent";

const Stores = () => {

    return (
        <div className={`px-4`}>
            <Alert />

            <Tabs defaultActiveKey="store" className="mb-3">
                <Tab eventKey="store" title="Lojas">
                    <StoreComponent />
                </Tab>
                <Tab eventKey="address" title="Endereços">
                    <AddressStoreComponent />
                </Tab>
                <Tab eventKey="tax" title="Taxas de entrega">
                    <DeliveryTaxComponent />
                </Tab>
            </Tabs>
        </div>
    )
}

export default Stores;