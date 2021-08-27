import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import InputMask from "react-input-mask";
import Select, { ValueType } from 'react-select';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { AddressStore } from "../../models/AddressStore";
import { Store } from "../../models/Store";
import { SelectModel } from "../../models/utils/SelectModel";
import Api, { ADDRESS_STORE_URL, STORE_URL } from "../../services/api";

import styles from '../../styles/store.module.css';
import { ViaCepModel } from "../../models/utils/ViaCepModel";
import Alert from "../Alert";

const AddressStoreComponent = () => {

    const [search, setSearch] = useState("");
    const [addressStores, setAddressStores] = useState([] as AddressStore[]);
    const [addressStoreUpd, setAddressStoreUpd] = useState({} as AddressStore);
    const [initAddressStores, setInitAddressStores] = useState([] as AddressStore[]);
    
    const [cep, setCep] = useState("");
    const [addressText, setAddressText] = useState("");
    const [complement, setComplement] = useState("");
    const [neighborhood, setNeighborhood] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");

    const [cepError, setCepError] = useState("");
    const [addressTextError, setAddressTextError] = useState("");
    const [neighborhoodError, setNeighborhoodError] = useState("");
    const [cityError, setCityError] = useState("");
    const [stateError, setStateError] = useState("");

    const [inputDisable, setInputDisable] = useState(false);
    
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
        
        const getAddressStores = async () => {

            await api.get(ADDRESS_STORE_URL).then(res => {
                setAddressStores(res);
                setInitAddressStores(res);
            });
        }
        getAddressStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initAddressStores?.filter(cp =>
            cp.cep.toLowerCase().includes(search.toLowerCase())
        );
        setAddressStores(results);
    }, [initAddressStores, search]);

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
                setOptionStore(modelSelect);
            })
            .catch(err => {
                console.log(err);
            });
        }
        getStores();
    }, [api]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var cError = Validations.validateRequiredField(cep, "cep");
        var sError = Validations.validateRequiredSelect(store, "loja");
        var aError = Validations.validateRequiredField(addressText, "rua");
        var nError = Validations.validateRequiredField(neighborhood, "bairro");
        var ciError = Validations.validateRequiredField(city, "cidade");
        var staError = Validations.validateRequiredField(state, "estado");

        if(cError || sError || aError || nError || ciError || staError)
        {
            setCepError(cError);
            setStoreError(sError);
            setAddressTextError(aError);
            setNeighborhoodError(nError);
            setCityError(cityError);
            setStateError(staError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new AddressStore();
                model.storeId = store?.value!;
                model.cep = cep;
                model.addressText = addressText;
                model.complement = complement;
                model.neighborhood = neighborhood;
                model.city = city;
                model.state = state;
                model.country = 'BR';
                
                await api.insert(ADDRESS_STORE_URL, model)
                .then(res => {
                    const cpn = res.data.data as AddressStore;
                    setAddressStores([...addressStores, cpn]);
                    setInitAddressStores([...initAddressStores, cpn]);

                    Utils.alertLocalStorage('Endereço inserido com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    handleModalAddUpd(false);
                })
                .catch(_ => {
                    Utils.alertLocalStorage(`Ocorreu um erro ao adicionar!`, false);

                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                });
            }
            else 
            {
                addressStoreUpd.storeId = store?.value!;
                addressStoreUpd.cep = cep;
                addressStoreUpd.addressText = addressText;
                addressStoreUpd.complement = complement;
                addressStoreUpd.neighborhood = neighborhood;
                addressStoreUpd.city = city;
                addressStoreUpd.state = state;
                addressStoreUpd.country = 'BR';
                
                
                await api.update(ADDRESS_STORE_URL, addressStoreUpd)
                .then(res => {
                    const cpn = res.data.data as AddressStore;
                    Utils.alertLocalStorage('Endereço atualizado com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initAddressStores.filter((x) => x.id !== cpn.id);
                    setAddressStores([...newCpn, cpn]);
                    setInitAddressStores([...newCpn, cpn]);
                    handleModalAddUpd(false);
                })
                .catch(_ => {
                    Utils.alertLocalStorage(`Ocorreu um erro ao atualizar!`, false);

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
            await api.delete(ADDRESS_STORE_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Endereço removido com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initAddressStores.filter((x) => x.id !== idRemove);
                setAddressStores(newCpn);
                setInitAddressStores(newCpn);
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
            setStore(null);
            setCep('');
            setAddressText('');
            setComplement('');
            setNeighborhood('');
            setCity('');
            setState('');
            setInputDisable(false);
            setShowModalAdd(isOpen);
        }
        else
        {
            if(id !== '')
            {
                setBtnTxtAdd('Atualizar');
                await api.getById(ADDRESS_STORE_URL, id)
                .then(res => {
                    const cpn = res as AddressStore;
                    setAddressStoreUpd(cpn);
                    setCep(cpn.cep);
                    setIdUpdate(id !== '' ? id : idUpdate);
                })
                .catch(err => {
                    console.log(err);
                    Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados da endereço', false);
                    setShowModalAdd(false);
                });
            }
            else
            {
                setBtnTxtAdd('Adicionar');
                setIdUpdate('');
                setCep('');
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

    const handleStore = (event: ValueType<SelectModel, false>) => setStore(event);

    const handleCepSearch = async () => {

        await api.cepSearch(Utils.removeDiacritics(cep))
        .then(res => {
            const viaCep = res as ViaCepModel;
            setAddressText(viaCep.logradouro);
            setComplement(viaCep.complemento);
            setNeighborhood(viaCep.bairro);
            setCity(viaCep.localidade);
            setState(viaCep.uf);
            setInputDisable(true);
        })
        .catch(err => {
            console.log(err);
        });
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
                        Adicionar endereço
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
                        <Form.Label>CEP</Form.Label>
                        <InputMask 
                            mask="99.999-999" 
                            onChange={(e) => setCep(e.target.value)} 
                            value={cep} 
                            className={`form-control`}
                            onBlur={handleCepSearch}
                        />
                        <Form.Text className="text-danger">
                            {cepError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Rua</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite a rua" 
                            value={addressText}
                            onChange={(e) => setAddressText(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {addressTextError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Complemento</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o complemento" 
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Bairro</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o bairro" 
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            disabled={inputDisable}
                        />
                        <Form.Text className="text-danger">
                            {neighborhoodError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Cidade</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite a cidade" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={inputDisable}
                        />
                        <Form.Text className="text-danger">
                            {cityError}
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className={`mb-2`}>
                        <Form.Label>Estado</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o estado" 
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            disabled={inputDisable}
                        />
                        <Form.Text className="text-danger">
                            {stateError}
                        </Form.Text>
                    </Form.Group>
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
                        Remover endereço
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
                    Endereços
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar endereço
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
                {addressStores?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Loja</th>
                                <th>Endereço</th>
                                <th>CEP</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {addressStores.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.store?.name}
                                    </td>
                                    <td>
                                        {model.addressText}
                                    </td>
                                    <td>
                                        {model.cep}
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
                : <div><p>Nenhum endereço adicionado.</p></div>}
            </div>
        </div>
    )
}

export default AddressStoreComponent;