import { ReactNode, useState } from "react";
import { faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Accordion, AccordionProps, Card } from "react-bootstrap";
import styles from '../styles/default.module.css';

type Props = AccordionProps & {
    title: string;
    body: ReactNode;
}

const AccordionMenu = ({ title, body, ...rest }: Props) => {

    const [open, setOpen] = useState(false);

    return (
        <Accordion {...rest}>
            <Card>
                <Accordion.Toggle 
                    as={Card.Header} 
                    eventKey="0" 
                    className={`${styles.header_prod}`}
                    onClick={() => setOpen(!open)}
                >
                    <span className={`${styles.span_header_prod}`}>
                        {title}
                    </span>
                    { !open ?
                        <div>
                            <FontAwesomeIcon icon={faSortUp} className={`${styles.icon_header_bottom}`} />
                        </div>
                    :
                        <div>
                            <FontAwesomeIcon icon={faSortDown} className={`${styles.icon_header_top}`} />
                        </div>
                    }
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                    <Card.Body>
                        {body}
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    )
}

export default AccordionMenu;