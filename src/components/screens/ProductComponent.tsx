import React, { useEffect, useMemo, useRef, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import { faSearch, faSyncAlt, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NumberFormat from "react-number-format";
import Select, { ValueType } from "react-select";
import Alert from "../Alert";
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { Product } from "../../models/Product";
import { Category } from "../../models/Category";
import { SelectModel } from "../../models/utils/SelectModel";
import { Item } from "../../models/Item";
import { Image } from "../../models/Image";
import { CategoryProduct } from "../../models/CategoryProduct";
import Api, { CATEGORY_URL, IMAGE_URL, ITEM_URL, PRODUCT_URL } from "../../services/api";
import AccordionMenu from "../AccordionMenu";
import { ProductItem } from "../../models/ProductItem";
import styles from '../../styles/default.module.css';
import logo from '../../assets/logo.png';

const ProductComponent = () => {

    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([] as Product[]);
    const [productUpd, setProductUpd] = useState({} as Product);
    const [initProducts, setInitProducts] = useState([] as Product[]);

    const [items, setItems] = useState([] as Item[]);
    const [defaultItems, setDefaultItems] = useState([] as Item[]);
    const [additionalItems, setAdditionalItems] = useState([] as Item[]);
    
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [isOneItem, setIsOneItem] = useState(false);
    const [category, setCategory] = useState<SelectModel | null>();
    const [optionCategory, setOptionCategory] = useState<SelectModel[]>();

    const [categoryError, setCategoryError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [priceError, setPriceError] = useState("");

    const [image, setImage] = useState('');
    const [filename, setFilename] = useState('Selecione uma imagem (máx. 5MB)');
    const fileInput = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File>();

    const [idUpdate, setIdUpdate] = useState("");
    const [idRemove, setIdRemove] = useState("");
    
    const [btnDisableAdd, setBtnDisableAdd] = useState(false);
    const [btnTxtAdd, setBtnTxtAdd] = useState<string | object>("Adicionar");
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    const [btnDisableRemove, setBtnDisableRemove] = useState(false);
    const [btnTxtRemove, setBtnTxtRemove] = useState<string | object>("Remover");
    const [showModalRemove, setShowModalRemove] = useState(false);

    const api = useMemo(() => new Api(), []);
    
    useEffect(() => {
        
        const getProducts = async () => {

            await api.get(PRODUCT_URL).then(res => {
                setProducts(res);
                setInitProducts(res);
            });
        }
        getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initProducts?.filter(cp =>
            cp.title.toLowerCase().includes(search.toLowerCase())
        );
        setProducts(results);
    }, [initProducts, search]);

    useEffect(() => {
        
        const getCategorys = async () => {

            await api.get(CATEGORY_URL)
            .then(res => {

                const categorys = res as Category[];

                var modelSelect = new Array<SelectModel>();
                categorys!.forEach(g => {   
                    var cSel = new SelectModel(g.id, g.title);
                    modelSelect.push(cSel);
                });
                setOptionCategory(modelSelect);
            })
            .catch(err => {
            });
        }
        getCategorys();
        
        const getItems = async () => {

            await api.get(ITEM_URL)
            .then(res => {
                const resi = res as Item[];
                setItems(resi);
            })
            .catch(err => {
            });
        }
        getItems();
    }, [api]);

    const handleCategory = (event: ValueType<SelectModel, false>) => setCategory(event);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files !== null)
        {
            var file = e.target.files[0];
            var mb = 5 * 1024 * 1024;
            
            if(file.size > mb)
            {
                alert('O arquivo não pode ser maior que 5MB!');
            }
            else if(Utils.validImageExtensions.filter(x => x === file.type.toString()).length === 0)
            {
                alert('O arquivo deve ser uma imagem!');
            }
            else
            {
                setFilename(file.name);
                setSelectedFile(file);
            }
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var catError = Validations.validateRequiredSelect(category, "categoria");
        var cError = Validations.validateRequiredField(title, "nome");
        var pError = Validations.validateRequiredField(price, "preço");

        if(catError || cError || pError)
        {
            setCategoryError(catError);
            setTitleError(cError);
            setPriceError(pError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new Product();
                model.title = title;
                model.description = description;
                model.price = Number.parseFloat(Utils.convertToCurrencyDb(price));
                model.isOneItem = isOneItem;
                model.categoryProducts = new Array<CategoryProduct>();
                model.categoryProducts.push(new CategoryProduct(category?.value!, model.id));
                
                if(defaultItems.length > 0 || additionalItems.length > 0)
                {
                    model.productItems = new Array<ProductItem>();

                    defaultItems.forEach(x => {

                        let newpi = new ProductItem();
                        newpi.isDefault = true;
                        newpi.price = x.price;
                        newpi.itemId = x.id;
                        model.productItems?.push(newpi);
                    });

                    additionalItems.forEach(x => {

                        let newpi = new ProductItem();
                        newpi.isDefault = false;
                        newpi.price = x.price;
                        newpi.itemId = x.id;
                        model.productItems?.push(newpi);
                    });
                }

                const addProduct = async () => {

                    await api.insert(PRODUCT_URL, model)
                    .then(resp => {
                        const cpn = resp.data.data as Product;

                        Utils.alertLocalStorage('Produto inserido com sucesso!', true);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Adicionar');
                        setProducts([...products, cpn]);
                        setInitProducts([...initProducts, cpn]);
                        handleModalAddUpd(false);
                    })
                    .catch(err => {
                        Utils.alertLocalStorage(`${err.data.message}`, false);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Adicionar');
                    });
                }
                
                if(selectedFile !== undefined)
                {
                    await api.insertImage(`${IMAGE_URL}/upload`, selectedFile)
                    .then(async res => {
                        const image = res.data.image as Image;
                        model.image = image.fileUrl;
    
                        await addProduct();
                    });
                }
                else
                {
                    await addProduct();
                }
            }
            else 
            {
                productUpd.id = idUpdate;
                productUpd.title = title;
                productUpd.description = description;
                productUpd.price = Number.parseFloat(Utils.convertToCurrencyDb(price));
                productUpd.isOneItem = isOneItem;
                productUpd.categoryProducts = new Array<CategoryProduct>();
                productUpd.categoryProducts.push(new CategoryProduct(category?.value!, productUpd.id));
                
                if(defaultItems.length > 0 || additionalItems.length > 0)
                {
                    productUpd.productItems = new Array<ProductItem>();

                    defaultItems.forEach(x => {

                        let newpi = new ProductItem();
                        newpi.isDefault = true;
                        newpi.price = x.price;
                        newpi.itemId = x.id;
                        productUpd.productItems?.push(newpi);
                    });

                    additionalItems.forEach(x => {

                        let newpi = new ProductItem();
                        newpi.isDefault = false;
                        newpi.price = x.price;
                        newpi.itemId = x.id;
                        productUpd.productItems?.push(newpi);
                    });
                }
                
                const update = async () => {
                    await api.update(PRODUCT_URL, productUpd)
                    .then(res => {
                        const cpn = res.data.data as Product;

                        Utils.alertLocalStorage('Produto atualizado com sucesso!', true);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Atualizar');
                        const newCpn = initProducts;
                        const index = initProducts.findIndex(x => x.id === cpn.id);
                        newCpn[index] = cpn;
                        setProducts([...newCpn]);
                        setInitProducts([...newCpn]);
                        handleModalAddUpd(false);
                    })
                    .catch(err => {
                        Utils.alertLocalStorage(`${err.data.message}`, false);
                        setBtnDisableAdd(false);
                        setBtnTxtAdd('Atualizar');
                    });
                }

                if(selectedFile !== undefined)
                {
                    await api.insertImage(`${IMAGE_URL}/upload`, selectedFile)
                    .then(async res => {
                        const image = res.data.image as Image;
                        productUpd.image = image.fileUrl;

                        await update();
                    });
                }
                else
                {
                    await update();
                }
            }
        }
    }

    const handleRemove = async () => {

        if(idRemove === '')
        {
            Utils.alertLocalStorage(`Ocorreu um erro ao remover!`, false);
            handleModalRemove(false);
        }
        else
        {   
            await api.delete(PRODUCT_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Produto removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initProducts.filter((x) => x.id !== idRemove);
                setProducts(newCpn);
                setInitProducts(newCpn);
                handleModalRemove(false);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage(`Ocorreu um erro ao remover!`, false);
                
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');
                handleModalRemove(false);
            });
        }
    }

    const handleModalAddUpd = async (isOpen: boolean, id: string = '') => {

        if(!isOpen)
        {
            setCategory(null);
            setTitle('');
            setDescription('');
            setImage('');
            setFilename('');
            setSelectedFile(undefined);
            setPrice('');
            setIsOneItem(false);
            setDefaultItems([]);
            setAdditionalItems([]);
            setShowModalAdd(isOpen);
            setCategoryError('');
            setTitleError('');
            setPriceError('');
        }
        else
        {
            if(id !== '')
            {
                setBtnTxtAdd('Atualizar');
                await api.getById(PRODUCT_URL, id)
                .then(res => {
                    const cpn = res as Product;

                    setProductUpd(cpn);
                    setCategory(optionCategory?.find(x => x.value === cpn.categoryProducts?.find(x => x !== null)?.categoryId));
                    setTitle(cpn.title);
                    setDescription(cpn.description);
                    setPrice(Utils.currencyValue(cpn.price).toString());
                    setIsOneItem(cpn.isOneItem);

                    if(cpn.image)
                    {
                        setFilename('Imagem já selecionada!');
                        setImage(cpn.image);
                    }

                    if(cpn.productItems !== null)
                    {
                        handlePopulateItems(cpn.productItems);
                    }

                    setIdUpdate(id !== '' ? id : idUpdate);
                })
                .catch(err => {
                    console.log(err);
                    Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados do produto', false);
                    setShowModalAdd(false);
                });
            }
            else
            {
                setBtnTxtAdd('Adicionar');
                setIdUpdate('');
                setTitle('');
            }
            setShowModalAdd(isOpen);
        }
    }

    const handleModalRemove = (isRemove: boolean, id: string = '') => {

        setIdRemove(id !== '' ? id : idRemove);
        setShowModalRemove(isRemove);
    }

    const handleKeypress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
          handleAdd();
        }
    }

    const handlePopulateItems = (pItems: ProductItem[]) => {

        var defItems = new Array<Item>();
        var addItems = new Array<Item>();
        
        pItems.forEach(pi => {
            if(pi.isDefault)
            {
                defItems.push(items.find(x => x.id === pi.itemId)!);
            }
            else 
            {
                addItems.push(items.find(x => x.id === pi.itemId)!);
            }
        });

        setDefaultItems(defItems);
        setAdditionalItems(addItems);
    }

    const handleCheckedItems = (item: Item, items: Item[]) : boolean => {

        if(items.includes(item))
        {
            return true;
        }
        return false;
    }

    const handleChangeItems = (e: React.ChangeEvent<HTMLInputElement>, item: Item, 
        items: Item[], setItems: React.Dispatch<React.SetStateAction<Item[]>>) => {

        var newItems = [...items];
        
        if(e.target.checked)
            newItems.push(item);
        else
            newItems = newItems.filter(x => x.id !== item.id);
        
        setItems(newItems);
    }

    const handleRemoveImage = () => {
        setFilename('Selecione uma imagem (máx. 5MB)');
        setSelectedFile(undefined);
    }
    
    return (
        <div className={`px-4`}>

            <Alert />

            <Modal 
                show={showModalAdd} 
                onHide={() => handleModalAddUpd(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Adicionar produto
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>
                    <Form.Group className={`mb-2`}>
                        <Form.Label>Categoria</Form.Label>
                        <Select 
                            value={category} 
                            onChange={(e: ValueType<SelectModel, false>) => handleCategory(e)}
                            options={optionCategory} 
                            placeholder='Selecione a categoria'
                            menuPlacement='bottom'
                            menuPosition='fixed'
                        />
                        <Form.Text className="text-danger">
                            {categoryError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-3`}>
                        <Form.Label>Imagem</Form.Label>
                        {image ? 
                        <div>
                            <img 
                                src={image} 
                                alt='Imagem do produto' 
                                className={`${styles.img_table} mb-2 ms-2`} 
                            />
                        </div> : ''}
                        <div>
                            <input 
                                type='file' 
                                style={{ display: "none" }} 
                                accept=".png,.jpg,.jpeg"
                                onChange={handleFileInput}
                                id='file'
                                ref={fileInput}
                            />
                            <button 
                                type='button'
                                className={`button btn_file_curr`}
                                onClick={e => fileInput.current && fileInput.current.click()}
                            >
                                Escolher arquivo
                            </button>
                            <div className={`div_file_curr`}>
                                <span>
                                    {filename}
                                </span>
                                {selectedFile !== undefined ?
                                    <button 
                                        className={`button ms-2`} 
                                        onClick={() => handleRemoveImage()}
                                    >
                                        <FontAwesomeIcon 
                                            icon={faTimes} 
                                            title='Remover imagem'
                                        />
                                    </button>
                                : ''}
                            </div>
                        </div>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o nome" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            />
                        <Form.Text className="text-danger">
                            {titleError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Descrição</Form.Label>
                        <Form.Control 
                            as='textarea'
                            placeholder="Digite a descrição" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Preço</Form.Label>
                        <NumberFormat 
                            className={`form-control`}
                            placeholder="Digite o preço" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            decimalSeparator=','
                            thousandSeparator='.'
                            inputmode="numeric"
                        />
                        <Form.Text className="text-danger">
                            {priceError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`} controlId="formCheckbox">
                        <Form.Check 
                            type="checkbox" 
                            label="Selecionar apenas 1 item?"
                            checked={isOneItem} 
                            onChange={() => setIsOneItem(!isOneItem)}
                        />
                    </Form.Group>

                    <AccordionMenu
                        title='Itens inclusos'
                        body={
                            items.map((item) => (
                                <Form.Group className={`mb-2`} controlId={`${item.id}defs`}>
                                    <Form.Check 
                                        type="checkbox" 
                                        label={`${item.title}`}
                                        checked={handleCheckedItems(item, defaultItems)}
                                        onChange={(e) => 
                                            handleChangeItems(e, item, defaultItems, setDefaultItems)
                                        }
                                    />
                                </Form.Group>
                            ))
                        }
                        className={`mb-2`}
                    />

                    <AccordionMenu
                        title='Itens adicionais'
                        body={
                            items.map((item) => (
                                <Form.Group className={`mb-2`} controlId={`${item.id}adds`}>
                                    <Form.Check 
                                        type="checkbox" 
                                        label={`${item.title} (R$ ${item.price})`}
                                        checked={handleCheckedItems(item, additionalItems)}
                                        onChange={(e) => 
                                            handleChangeItems(e, item, additionalItems, setAdditionalItems)
                                        }
                                    />
                                </Form.Group>
                            ))
                        }
                        className={`mb-2`}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalAddUpd(false)}>
                        Cancelar
                    </button>
                    <button 
                        className={`button`} 
                        onClick={handleAdd}
                        disabled={btnDisableAdd}
                    >
                        {btnTxtAdd}
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal 
                show={showModalRemove} 
                onHide={() => handleModalRemove(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Remover produto
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Tem certeza que deseja remover?</p>
                </Modal.Body>
                <Modal.Footer>
                    <button className={`button`} onClick={() => handleModalRemove(false)}>
                        Cancelar
                    </button>
                    <button 
                        className={`button`} 
                        onClick={handleRemove}
                        disabled={btnDisableRemove}
                    >
                        {btnTxtRemove}
                    </button>
                </Modal.Footer>
            </Modal>

            <div>
                <h3 className={`title`}>
                    Produtos
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar produto
                </button>
                <InputGroup className={`mt-2 mt-md-0`}>
                    <Form.Control 
                        type="text"
                        placeholder="Pesquise aqui..."
                        value={search}
                        onChange={handleChange}
                    />
                    <button className={`button`}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </InputGroup>
            </div>

            <div className={`mt-3`}>
                {products?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <tbody>
                            {products.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.image !== '' 
                                        ?
                                        <img 
                                            src={model.image} 
                                            alt={`${key} - ${model.title}`}
                                            className={`${styles.img_table}`} 
                                        />
                                        :
                                        <img 
                                            src={logo} 
                                            alt={`${key} - ${model.title}`}
                                            className={`${styles.img_table}`} 
                                        />
                                        }
                                    </td>
                                    <td>
                                        {model.title} <br/>
                                        <small className={`${styles.text_secondary}`}>
                                            {model.description}
                                        </small>
                                    </td>
                                    <td>
                                        {`R$ ${Utils.currencyValue(model.price)}`}
                                    </td>
                                    <td align='right'>
                                        <button 
                                            className={`button`}
                                            onClick={() => handleModalAddUpd(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faSyncAlt} 
                                                className={`${styles.table_icon}`}
                                                title='Atualizar' 
                                            />
                                        </button>
                                        <button 
                                            className={`button ms-2`} 
                                            onClick={() => handleModalRemove(true, model.id)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faTrash} 
                                                className={`${styles.table_icon}`}
                                                title='Apagar'
                                            />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                : <div><p>Nenhum produto adicionado.</p></div>}
            </div>
        </div>
    )
}

export default ProductComponent;