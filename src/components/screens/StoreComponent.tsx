import { useEffect, useState } from "react";
import { Form, InputGroup, Modal, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select, { ValueType } from 'react-select';
import { Utils } from "../../configs/Utils";
import { Validations } from "../../configs/Validations";
import { Store } from "../../models/Store";
import { StoreDayHour } from "../../models/StoreDayHour";
import Api, { STOREDAYHOUR_URL, STORE_URL } from "../../services/api";

import styles from '../../styles/store.module.css';
import AccordionMenu from "../AccordionMenu";
import Alert from "../Alert";
import { SelectModel } from "../../models/utils/SelectModel";

const StoreComponent = () => {

    const [search, setSearch] = useState("");
    const [stores, setStores] = useState([] as Store[]);
    const [storeUpd, setStoreUpd] = useState({} as Store);
    const [initStores, setInitStores] = useState([] as Store[]);
    
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [storeDayHours, setStoreDayHours] = useState<StoreDayHour[] | null>([]);
    const [initStoreDayHours, setInitStoreDayHours] = useState<StoreDayHour[] | null>([]);
    const [optionStoreDayHour, setOptionStoreDayHour] = useState<SelectModel[]>();

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
        
        const getStores = async () => {

            await api.get(STORE_URL).then(res => {

                var sts = res as Store[];
                sts.forEach(x => {
                    x.storeDayHours?.forEach(y => {
                        y.dayOfWeekString = Utils.convertDayWeek(y.dayOfWeek);
                    });
                });

                setStores(sts);
                setInitStores(sts);
            });
        }
        getStores();

        const getSelectStoreDayHours = () => {

            var modelSelect = new Array<SelectModel>();
            Utils.daysOfWeek.forEach((g, i) => {   
                var cSel = new SelectModel(i.toString(), g);
                modelSelect.push(cSel);
            });
            setOptionStoreDayHour(modelSelect);
        }
        getSelectStoreDayHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const results = initStores?.filter(cp =>
            cp.name.toLowerCase().includes(search.toLowerCase())
        );
        setStores(results);
    }, [initStores, search]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
    };

    const handleAdd = async () => {

        setBtnDisableAdd(true);
        setBtnTxtAdd(<Spinner animation="grow" variant="light" size="sm" />);

        var cError = Validations.validateRequiredField(name, "nome");

        if(cError)
        {
            setNameError(cError);
            setBtnDisableAdd(false);
            setBtnTxtAdd(idUpdate !== '' ? 'Atualizar' : 'Adicionar');
        }
        else
        {
            if(idUpdate === '')
            {
                var model = new Store();
                model.name = name;
                
                await api.insert(STORE_URL, model)
                .then(async res => {
                    const cpn = res.data.data as Store;

                    if(storeDayHours !== null && storeDayHours.length > 0)
                    {
                        storeDayHours.forEach(async sth => {
                            
                            sth.storeId = cpn.id;
                            await api.insert(STOREDAYHOUR_URL, sth);
                        });
                    }

                    Utils.alertLocalStorage('Loja inserida com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Adicionar');
                    setStores([...stores, cpn]);
                    setInitStores([...initStores, cpn]);
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
                storeUpd.name = name;
                
                await api.update(STORE_URL, storeUpd)
                .then(res => {
                    const cpn = res.data.data as Store;

                    if(initStoreDayHours !== null && initStoreDayHours.length > 0)
                    {
                        var removeSth = initStoreDayHours.filter(x => !storeDayHours?.includes(x));
                        var addSth = storeDayHours?.filter(x => !initStoreDayHours?.includes(x));

                        removeSth.forEach(async sth => {
                            await api.delete(STOREDAYHOUR_URL, sth.id);
                        });

                        addSth?.forEach(async sth => {
                            sth.storeId = cpn.id;
                            await api.insert(STOREDAYHOUR_URL, sth);
                        });
                    }

                    Utils.alertLocalStorage('Loja atualizada com sucesso!', true);
                    setBtnDisableAdd(false);
                    setBtnTxtAdd('Atualizar');
                    const newCpn = initStores.filter((x) => x.id !== cpn.id);
                    setStores([...newCpn, cpn]);
                    setInitStores([...newCpn, cpn]);
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
            await api.delete(STORE_URL, idRemove)
            .then(_ => {
                Utils.alertLocalStorage('Loja removida com sucesso!', true);
                setBtnDisableRemove(false);
                setBtnTxtRemove('Remover');

                const newCpn = initStores.filter((x) => x.id !== idRemove);
                setStores(newCpn);
                setInitStores(newCpn);
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

        if(id !== '')
        {
            setBtnTxtAdd('Atualizar');
            await api.getById(STORE_URL, id)
            .then(res => {
                const cpn = res as Store;
                setStoreUpd(cpn);
                setName(cpn.name);
                setInitStoreDayHours(cpn.storeDayHours);
                setStoreDayHours(cpn.storeDayHours);
                setIdUpdate(id !== '' ? id : idUpdate);
            })
            .catch(err => {
                console.log(err);
                Utils.alertLocalStorage('Ocorreu um erro ao pegar os dados da loja', false);
                setShowModalAdd(false);
            });
        }
        else
        {
            setBtnTxtAdd('Adicionar');
            setIdUpdate('');
            setName('');
            setStoreDayHours([]);
        }
        setShowModalAdd(isOpen);
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

    const handleAddStoreDayHour = () => {

        var newStoreDayHours = [...storeDayHours ?? []];

        if(newStoreDayHours == null || newStoreDayHours.length === 0)
        {
            newStoreDayHours = new Array<StoreDayHour>();
        }

        newStoreDayHours.push(new StoreDayHour());
        setStoreDayHours(newStoreDayHours);
    }

    const handleRemoveStoreDayHour = (index: number) => {

        var newStoreDh = [...storeDayHours ?? []];
        newStoreDh.splice(index, 1);
        setStoreDayHours([...newStoreDh]);
    }

    const handleChangeDayWeek = (index: number, event: ValueType<SelectModel, false>) => {

        var storeDh = [...storeDayHours ?? []];
        storeDh[index].dayOfWeek = Number(event?.value);
        setStoreDayHours([...storeDh]);
    }

    const handleChangeHourOpen = (index: number, value: string) => {

        var storeDh = [...storeDayHours ?? []];
        storeDh[index].hourOpen = value;
        setStoreDayHours([...storeDh]);
    }

    const handleChangeHourClose = (index: number, value: string) => {

        var storeDh = [...storeDayHours ?? []];
        storeDh[index].hourClose = value;
        setStoreDayHours([...storeDh]);
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
                        Adicionar loja
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body onKeyPress={handleKeypress}>
                    <Form.Group className={`mb-2`}>
                        <Form.Label>Nome</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Digite o nome" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Form.Text className="text-danger">
                            {nameError}
                        </Form.Text>
                    </Form.Group>

                    <button className={`button mb-2 mt-2`} onClick={handleAddStoreDayHour}>
                        Adicionar dia/horário
                    </button>

                    <AccordionMenu
                        title='Dias e horários'
                        body={
                            storeDayHours?.map((item, index) => (
                                <div className={`d-flex align-items-center mb-2`}>
                                    <Form.Group className={`${styles.selectDayWeek} me-2`}>
                                        <Form.Label>Dia</Form.Label>
                                        <Select 
                                            value={new SelectModel(item.dayOfWeek.toString(), Utils.convertDayWeek(item.dayOfWeek))} 
                                            onChange={(e: ValueType<SelectModel, false>) => handleChangeDayWeek(index, e)}
                                            options={optionStoreDayHour} 
                                            placeholder='Selecione'
                                            menuPlacement='bottom'
                                            menuPosition='fixed'
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Abre</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="00:00"
                                            className={`${styles.inputHourMinute} me-2`}
                                            value={item.hourOpen}
                                            onChange={(e) => handleChangeHourOpen(index, Utils.hourMinuteMask(e.target.value))}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>Fecha</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="00:00"
                                            className={`${styles.inputHourMinute} me-2`}
                                            value={item.hourClose}
                                            onChange={(e) => handleChangeHourClose(index, Utils.hourMinuteMask(e.target.value))}
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <button 
                                            className={`button`} 
                                            onClick={() => handleRemoveStoreDayHour(index)}
                                        >
                                            <FontAwesomeIcon 
                                                icon={faTimes} 
                                                title='Remover dia/horário'
                                            />
                                        </button>
                                    </Form.Group>

                                </div>
                            ))
                        }
                        defaultActiveKey='0'
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
                        Remover loja
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
                    Lojas
                </h3>
            </div>

            <div className={`${styles.div_btns}`}>
                <button
                    onClick={() => handleModalAddUpd(true)}
                    className={`button ${styles.btn_add} me-md-2 me-0`}
                >
                    Adicionar loja
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
                {stores?.length > 0 ? 
                    <Table className={`${styles.table}`} responsive>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Dias e horários</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((model, key) => (
                                <tr key={key}>
                                    <td>
                                        {model.name}
                                    </td>
                                    <td>
                                        {model.storeDayHours?.map((dayHour, k) => (
                                            <p key={k}>
                                                {dayHour.dayOfWeekString} - {dayHour.hourOpen} às {dayHour.hourClose}
                                            </p>
                                        ))}
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
                : <div><p>Nenhum loja adicionada.</p></div>}
            </div>
        </div>
    )
}

export default StoreComponent;