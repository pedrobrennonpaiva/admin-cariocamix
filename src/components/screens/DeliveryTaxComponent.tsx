import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import Select, { ValueType } from 'react-select';
import NumberFormat from "react-number-format";
import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import Leaflet from "leaflet";
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { DeliveryTax } from "../../models/DeliveryTax";
import { Store } from "../../models/Store";
import { SelectModel } from "../../models/utils/SelectModel";
import Api, { DELIVERY_TAX_URL, STORE_URL } from "../../services/api";
import Alert from "../Alert";

import mapPin from "../../assets/pin.svg";
import styles from '../../styles/store.module.css';

type Position = {
    lat: number;
    lng: number;
};

const DeliveryTaxComponent = () => {

    const MAPBOX = "pk.eyJ1IjoiY2FyaW9jYW1peCIsImEiOiJja3NxaTB1N2QwMGRwMnJqc3UzanFkOXhzIn0.3ktCZfBdJ7oreOmz-bWYwQ";
    const ACCESS_TOKEN_MAP_BOX = `access_token=${MAPBOX}`;
    const initialPosition = { lat: -22.7109674, lng: -43.3279008 };
    const [position, setPosition] = useState<Position | null>(null);

    const [search, setSearch] = useState("");
    const [deliveryTaxs, setDeliveryTaxs] = useState([] as DeliveryTax[]);
    const [deliveryTaxUpd, setDeliveryTaxUpd] = useState({} as DeliveryTax);
    const [initDeliveryTaxs, setInitDeliveryTaxs] = useState([] as DeliveryTax[]);
    
    const [radius, setRadius] = useState(0);
    const [price, setPrice] = useState("");

    const [radiusError, setRadiusError] = useState("");
    const [priceError, setPriceError] = useState("");
    
    const [initStores, setInitStores] = useState([] as Store[]);
    const [store, setStore] = useState<SelectModel | null>();
    const [optionStore, setOptionStore] = useState<SelectModel[]>();
    const [storeError, setStoreError] = useState("");

    const [idUpdate, setIdUpdate] = useState("");
    const [idRemove, setIdRemove] = useState("");
    
    const [btnDisableAdd, setBtnDisableAdd] = useState(false);
    const [btnTxtAdd, setBtnTxtAdd] = useState<string | object>("Adicionar");
    const [showModalAdd, setShowModalAdd] = useState(false);
    
    const [btnDisableRemove, setBtnDisableRemove] = useState(false);
    const [btnTxtRemove, setBtnTxtRemove] = useState<string | object>("Remover");
    const [showModalRemove, setShowModalRemove] = useState(false);

    const api = new Api();

    useEffect(() => {
        
        const getDeliveryTaxs = async () => {

            await api.get(DELIVERY_TAX_URL).then(res => {
                setDeliveryTaxs(res);
                setInitDeliveryTaxs(res);
            });
        }
        getDeliveryTaxs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initDeliveryTaxs?.filter(cp =>
            cp.radius.toString().includes(search.toLowerCase())
        );
        setDeliveryTaxs(results);
    }, [initDeliveryTaxs, search]);

    useEffect(() => {
        
        const getStores = async () => {

            await api.get(STORE_URL)
            .then(res => {

                const stores = res as Store[];

                var modelSelect = new Array<SelectModel>();
                stores!.forEach(g => {   
                    var cSel = new SelectModel(g.id, g.name);
                    modelSelect.push(cSel);
                });
                setInitStores(stores);
                setOptionStore(modelSelect);
            })
            .catch(err => {
                console.log(err);
            });
        }
        getStores();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var sError = Validations.validateRequiredSelect(store, "loja");
        var cError = Validations.validateNumberMoreThanZero(radius, "raio");
        var pError = Validations.validateRequiredField(price, "taxa");

        if(cError || sError || pError)
        {
            setRadiusError(cError);
            setStoreError(sError);
            setPriceError(pError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new DeliveryTax();
                model.storeId = store?.value!;
                model.radius = radius;
                model.price = Number.parseFloat(Utils.convertToCurrencyDb(price));

                await api.insert(DELIVERY_TAX_URL, model)
                .then(res => {
                    const cpn = res.data.data as DeliveryTax;
                    setDeliveryTaxs([...deliveryTaxs, cpn]);
                    setInitDeliveryTaxs([...initDeliveryTaxs, cpn]);

                    Utils.alertLocalStorage('Taxa de entrega inserida com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    handleModalAddUpd(false);
                })
                .catch(err => {
                    Utils.alertLocalStorage(`${err.data.message}`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                });
            }
            else 
            {
                deliveryTaxUpd.storeId = store?.value!;
                deliveryTaxUpd.radius = radius;
                deliveryTaxUpd.price = Number.parseFloat(Utils.convertToCurrencyDb(price));
                
                await api.update(DELIVERY_TAX_URL, deliveryTaxUpd)
                .then(res => {
                    const cpn = res.data.data as DeliveryTax;
                    Utils.alertLocalStorage('Taxa de entrega atualizada com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initDeliveryTaxs.filter((x) => x.id !== cpn.id);
                    setDeliveryTaxs([...newCpn, cpn]);
                    setInitDeliveryTaxs([...newCpn, cpn]);
                    handleModalAddUpd(false);
                })
                .catch(err => {
                    Utils.alertLocalStorage(`${err.data.message}`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                });
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
            await api.delete(DELIVERY_TAX_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Taxa de entrega removida com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initDeliveryTaxs.filter((x) => x.id !== idRemove);
                setDeliveryTaxs(newCpn);
                setInitDeliveryTaxs(newCpn);
                handleModalRemove(false);
            })
            .catch(err => {
                Utils.alertLocalStorage(`${err.data.message}`, false);
                
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');
                handleModalRemove(false);
            });
        }
    }

    const handleModalAddUpd = async (isOpen: boolean, id: string = '') => {

        if(!isOpen)
        {
            setStore(null);
            setRadius(0);
            setPrice('');
            setShowModalAdd(isOpen);
        }
        else
        {
            if(id !== '')
            {
                setBtnTxtAdd('Atualizar');
                await api.getById(DELIVERY_TAX_URL, id)
                .then(res => {
                    const cpn = res as DeliveryTax;
                    setDeliveryTaxUpd(cpn);
                    setRadius(cpn.radius);
                    setStore(optionStore?.find(x => x.value === cpn.storeId));
                    setPrice(Utils.currencyValue(cpn.price).toString());
                    setIdUpdate(id !== '' ? id : idUpdate);
                })
                .catch(err => {
                    console.log(err);
                    Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados da taxa de entrega', false);
                    setShowModalAdd(false);
                });
            }
            else
            {
                setBtnTxtAdd('Adicionar');
                setIdUpdate('');
                setRadius(0);
                setPrice('');
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

    const handleStore = async (event: ValueType<SelectModel, false>) => {

        var store = initStores.find(x => x.id === event?.value);

        if(store && store.addressStore)
        {
            const response = await fetchLocalMapBox(`${store.addressStore?.addressText!},${store.addressStore.neighborhood}`);
            var positionStore: Position = {
                lat: response.features[0].center[1],
                lng: response.features[0].center[0],
            }
            
            setPosition(positionStore ?? initialPosition);
            setStore(event);
        }
    }

    const mapPinIcon = Leaflet.icon({
        iconUrl: mapPin,
        iconSize: [58, 68],
        iconAnchor: [29, 68],
        popupAnchor: [170, 2],
    });
        
    const fetchLocalMapBox = (local: string) =>
        fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${local}.json?${ACCESS_TOKEN_MAP_BOX}`
        )
      .then(response => response.json())
      .then(data => data);
    
    const ChangeMapView = ({ coords }: any) => {
        const map = useMap();
        map.setView(coords, map.getZoom());
        return null;
    }
    
    return (
        <div>
            <Alert />

            <Modal 
                show={showModalAdd} 
                onHide={() => handleModalAddUpd(false)}
                centered
            >
                <Modal.Header>
                    <Modal.Title>
                        Adicionar taxa de entrega
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Loja</Form.Label>
                        <Select 
                            value={store} 
                            onChange={(e: ValueType<SelectModel, false>) => handleStore(e)}
                            options={optionStore} 
                            placeholder='Selecione a loja'
                            menuPlacement='bottom'
                            menuPosition='fixed'
                        />
                        <Form.Text className="text-danger">
                            {storeError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Raio</Form.Label>
                        <Form.Control 
                            type="number" 
                            placeholder="Digite o raio" 
                            value={radius}
                            onChange={(e) => setRadius(+e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {radiusError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Taxa</Form.Label>
                        <NumberFormat 
                            className={`form-control`}
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

                    <div className={`${styles.pageMap}`}>
                        <MapContainer
                            center={position ?? initialPosition}
                            zoom={15}
                            scrollWheelZoom={false}
                            style={{ width: '100%', height: 300 }}
                        >
                            <ChangeMapView coords={position ?? initialPosition} />
                            <TileLayer
                                url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX}`}
                            />
                    
                            {position && (
                                <Marker
                                    icon={mapPinIcon}
                                    position={position}
                                ></Marker>
                            )}

                            {position && radius && (
                                <Circle 
                                    center={position} 
                                    pathOptions={{ fillColor: 'blue' }} 
                                    radius={radius * 1000} 
                                />
                            )}
                        </MapContainer>

                    </div>
                    
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
                        Remover taxa de entrega
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
                    Taxas de entrega
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar taxa de entrega
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
                {deliveryTaxs?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Loja</th>
                                <th>Raio</th>
                                <th>Taxa</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryTaxs.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.store?.name}
                                    </td>
                                    <td>
                                        {model.radius}
                                    </td>
                                    <td>
                                        {Utils.currencyValue(model.price)}
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
                : <div><p>Nenhuma taxa de entrega adicionada.</p></div>}
            </div>
        </div>
    )
}

export default DeliveryTaxComponent;