import { Tab, Tabs } from "react-bootstrap";
import Alert from "../components/Alert";
import CategoryComponent from "../components/screens/CategoryComponent";
import ItemComponent from "../components/screens/ItemComponent";
import ProductComponent from "../components/screens/ProductComponent";

const Products = () => {

    return (
        <div className={`px-4`}>
            <Alert />

            <Tabs defaultActiveKey="product" className="mb-3">
                <Tab eventKey="product" title="Produtos" unmountOnExit>
                    <ProductComponent />
                </Tab>
                <Tab eventKey="category" title="Categorias">
                    <CategoryComponent />
                </Tab>
                <Tab eventKey="item" title="Itens">
                    <ItemComponent />
                </Tab>
            </Tabs>
        </div>
    )
}

export default Products;