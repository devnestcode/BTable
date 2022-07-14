import axios from "axios";
import React, { Children, cloneElement, createContext, useContext, useMemo, useState } from "react";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import './Table.css';

export const firtsContext = createContext({});
const { Provider: ProviderRow } = firtsContext;
const { Provider: ProviderFiltered } = firtsContext;
const MySwal = withReactContent(Swal);

export const BTBody = ({ children }) => {

    const { filtered, headers, configToggleBtn, reloadBTable } = useContext(firtsContext);

    async function handleImageClick(imgURL, urlChangeImg, idP) {
        const swalWithBootstrapButtons = MySwal.mixin({
            customClass: {
                confirmButton: 'btn btn-primary mx-3',
                cancelButton: 'btn btn-danger mx-3'
            },
            buttonsStyling: false
        })

        const { value: file } = await swalWithBootstrapButtons.fire({
            imageUrl: imgURL,
            imageWidth: '100%',
            imageAlt: 'Image Profile',
            title: 'Actualiza la imagen seleccionando otra',
            input: 'file',
            showCancelButton: true,
            confirmButtonText: 'Hecho',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            inputAttributes: {
                'accept': 'image/*',
                'aria-label': 'Upload your profile picture'
            }
        })
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                swalWithBootstrapButtons.fire({
                    title: 'Your uploaded picture',
                    imageUrl: event.target.result,
                    imageAlt: 'The uploaded picture',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, cambiarla',
                    cancelButtonText: 'No, cancelar',
                    reverseButtons: true,
                }).then((result) => {
                    if (result.isConfirmed) {
                        const imgData = new FormData();
                        imgData.append('file', file);
                        axios.post(route(urlChangeImg, idP), imgData)
                            .then(({ data: { success, message } }) => {
                                swalWithBootstrapButtons.fire({
                                    icon: success ? 'success' : 'error',
                                    title: message,
                                    showConfirmButton: false,
                                    timer: 1500,
                                    allowEnterKey: false,
                                    allowOutsideClick: false,
                                }).then((result) => {
                                    if (result.dismiss === swalWithBootstrapButtons.DismissReason.timer) {
                                        success && reloadBTable();
                                    }
                                })
                            }).catch(() => {
                                swalWithBootstrapButtons.fire({
                                    icon: 'error',
                                    title: 'Error en ruta',
                                    showConfirmButton: false,
                                    allowEnterKey: false,
                                    allowOutsideClick: false,
                                    timer: 1500,
                                });
                            })
                    } else if (
                        /* Read more about handling dismissals below */
                        result.dismiss === swalWithBootstrapButtons.DismissReason.cancel
                    ) {
                        swalWithBootstrapButtons.fire({
                            icon: 'info',
                            title: 'No se ha actualizado',
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
            };
            reader.readAsDataURL(file)
        }
    }

    return (
        <tbody>
            {filtered.length > 0 ? Object.values(filtered).map(p => {
                return (
                    <ProviderRow
                        key={p.id}
                        value={{ p, reloadBTable }}
                    >
                        <tr>
                            {headers.map((pHeader, i) => !pHeader.image ?
                                <td key={i}>{p[pHeader.labelDB]}</td> :
                                <td key={i}>
                                    <div className="d-flex justify-content-center align-items-center w-100">
                                        <div onClick={() => handleImageClick(p[pHeader.labelDB], pHeader.urlChangeImg, p.id)}
                                            className="image__profile align-items-center"
                                        >
                                            <img className="img-fluid w-100"
                                                src={p[pHeader.labelDB]}
                                                alt="imageProfile">
                                            </img>
                                        </div>
                                    </div>
                                </td>
                            )}
                            {children}
                            {
                                configToggleBtn?.toggleButton
                                &&
                                <BtnActive estado={p.estado}
                                    id={p.id}
                                    toggleButton={configToggleBtn.toggleButton}
                                    btnToggleStyle={configToggleBtn.btnToggleStyle}
                                    reloadBTable={reloadBTable}
                                />
                            }
                        </tr>
                    </ProviderRow>
                )
            }) :
                <tr>
                    <td colSpan={20}>
                        NO SE ENCONTRARON DATOS
                    </td>
                </tr>
            }
        </tbody>
    )
}

const BtnActive = ({ id, estado, toggleButton, btnToggleStyle, reloadBTable }) => {

    const [btnActive, setBtnActive] = useState(estado);

    const swalWithBootstrapButtons = MySwal.mixin({
        customClass: {
            confirmButton: 'btn btn-primary mx-3',
            cancelButton: 'btn btn-danger mx-3'
        },
        buttonsStyling: false
    })

    function handleChange(idC) {
        swalWithBootstrapButtons.fire({
            title: btnActive ? '¿Desea desactivar?' : '¿Desea activar?',
            text: btnActive ? 'Podrá volver a activarlo' : 'Podrá desactivarlo de nuevo',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, desactivarlo',
            cancelButtonText: 'No, cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                axios.post(route(toggleButton, idC))
                    .then(({ data: { success, message } }) => {
                        setBtnActive(!btnActive);
                        swalWithBootstrapButtons.fire({
                            icon: success ? 'success' : 'error',
                            title: message,
                            showConfirmButton: false,
                            timer: 1500,
                            allowEnterKey: false,
                            allowOutsideClick: false,
                        }).then((result) => {
                            if (result.dismiss === MySwal.DismissReason.timer) {
                                success && reloadBTable();
                            }
                        })
                    }).catch(() => {
                        swalWithBootstrapButtons.fire({
                            icon: 'error',
                            title: 'Error en ruta',
                            showConfirmButton: false,
                            allowEnterKey: false,
                            allowOutsideClick: false,
                            timer: 1500,
                        });
                    })
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire({
                    icon: 'info',
                    title: 'No se ha actualizado',
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        })
    }

    return (
        <td>
            <button onClick={() => handleChange(id)} type="button"
                className={`btn ${btnToggleStyle} btn-toggle ${btnActive && 'active'}`}
                data-toggle="button" aria-pressed="false" autoComplete="off">
                <div className="handle"></div>
            </button>
        </td>
    )
}

export const BTCButtons = ({ children }) => {

    const { p, reloadBTable } = useContext(firtsContext);

    return (
        <td>
            <div className="d-flex flex-row">
                {Children.map(children, (child => cloneElement(child, { data: p, reloadBTable: reloadBTable })))}
            </div>
        </td>
    )
}

export const BTCBody = ({ labelDB, selectOpt, urlChange }) => {

    const { p, reloadBTable } = useContext(firtsContext);
    const [_x, ...res] = selectOpt;
    const [opt, setOpt] = useState(p[labelDB]);

    const swalWithBootstrapButtons = MySwal.mixin({
        customClass: {
            confirmButton: 'btn btn-primary mx-3',
            cancelButton: 'btn btn-danger mx-3'
        },
        buttonsStyling: false
    })

    function handleChange(event) {
        const inputOpt = event.target.value;
        const changeData = new FormData();
        changeData.append('opt', inputOpt);
        axios.post(route(urlChange, p.id), changeData)
            .then(({ data: { success, message } }) => {
                swalWithBootstrapButtons.fire({
                    icon: success ? 'success' : 'error',
                    title: message,
                    showConfirmButton: false,
                    allowEnterKey: false,
                    allowOutsideClick: false,
                    timer: 1500,
                    
                }).then((result) => {
                    if (result.dismiss === MySwal.DismissReason.timer) {
                        setOpt(inputOpt);
                        success && reloadBTable();
                    }
                })
            }).catch(() => {
                swalWithBootstrapButtons.fire({
                    icon: 'error',
                    title: 'Error en ruta',
                    showConfirmButton: false,
                    allowEnterKey: false,
                    allowOutsideClick: false,
                    timer: 1500,
                });
            })
    }

    return (
        <>
            {!urlChange ? res.map((r, i) => {
                if (r.value == p[labelDB]) {
                    return <td key={i}>{r.label}</td>
                }
            }) :
                res.map((r, i) => {
                    if (r.value == p[labelDB]) {
                        return (
                            <td key={i} >
                                <select
                                    onChange={handleChange}
                                    id={`inp-${labelDB}`}
                                    name={`inp-${labelDB}`}
                                    className="form-select border rounded border-dark bg-white text-dark w-100 h-75"
                                    value={opt}
                                >
                                    {res.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </td>
                        )
                    }
                })

            }
        </>
    )
}

export const BTCRatingBody = ({ labelDB, sizeIcon }) => {

    const { p } = useContext(firtsContext);

    return (
        <td>
            <div className='d-inline-flex justify-content-center'>
                {[...Array(5)].map((_start, i) => {
                    const ratingValue = (i + 1);
                    return (
                        <div key={i}
                            style={{ color: `${ratingValue <= p[labelDB] ? '#FFA500' : '#AAAAAA'}` }}
                        >
                            <i
                                className={`fa-solid fa-star ${sizeIcon}`}
                            />
                        </div>
                    )
                })}
            </div>
        </td>
    )
}

export const BTCHead = ({ labelDB, filter, selectOpt, children }) => {

    const { handleChange } = useContext(firtsContext);

    return (
        <th className="align-middle" style={{ minWidth: '7rem' }}>
            <span>
                {children}
            </span>
            <br />
            {(() => {
                switch (filter) {
                    case 'select':
                        return (
                            <select
                                onChange={handleChange}
                                id={`inp-${labelDB}`}
                                name={`inp-${labelDB}`}
                                className="form-select border rounded border-dark bg-white text-dark w-100 h-75"
                                aria-label=""
                                defaultValue=""
                            >
                                {selectOpt.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
                            </select>
                        )
                    default:
                        break;
                }
            })()}
        </th>
    )
}

export const BTHead = ({ children }) => {

    const { headers, customButtons, handleChange, configToggleBtn, handleClickReset, filters } = useContext(firtsContext);

    return (
        <thead>
            <tr>
                {headers.map((hd, i) => {
                    if (hd.filter) {
                        return (
                            <th key={i}
                                className="align-middle"
                                style={{ minWidth: '7rem' }}
                            >
                                {hd.label}
                                <div className="input-group">
                                    <input
                                        id={`inp-${hd.labelDB}`}
                                        name={`inp-${hd.labelDB}`}
                                        className="form-control border-dark bg-white text-dark"
                                        type={hd.type}
                                        onChange={handleChange}
                                        aria-describedby={`button-addon${i}`}
                                        value={filters[`inp-${hd.labelDB}`]}
                                    />
                                    <button onClick={() => handleClickReset(`inp-${hd.labelDB}`)}
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        id={`button-addon${i}`}>
                                        X
                                    </button>
                                </div>

                            </th>
                        )
                    }
                    return <th scope="col" key={i} className="align-middle">{hd.label}</th>
                })}
                {children}
                {customButtons && <th></th>}
                {configToggleBtn?.toggleButton && <th className="align-middle">CAMBIAR ESTADO</th>}
            </tr>
        </thead>
    )
}

export const BTable = (
    {
        headers, first, customButtons, className, children,
        responsive = false,
        configToggleBtn,
        configReload: { setFirst, toggleIndex, nameData }
    }
) => {

    /* Se construye un Map para settear con vacio cada input dependiendo de los headers */
    const posibleInputs = new Map();
    headers.map(h => {
        posibleInputs.set(`inp-${h.labelDB}`, '')
    })
    /* El objeto contiene los nombres de los input filters vacios para tener referencia de ellos */
    const objectInputs = Object.fromEntries(posibleInputs);

    const [filters, setFilters] = useState(objectInputs);

    function handleChange(event) {
        const value = event.target.value

        setFilters(prevState => ({
            ...prevState, [event.target.name]: value
        }));
    }

    function handleClickReset(idFiltro) {
        setFilters(prevState => ({
            ...prevState, [idFiltro]: ''
        }));
    }

    function reloadBTable() {
        axios.get(route(toggleIndex))
            .then(({ data: response }) => {
                setFirst(response[nameData]);
            }).catch(() => {
                MySwal.fire({
                    icon: 'error',
                    title: 'Error al actualizar',
                    showConfirmButton: false,
                    timer: 1500
                });
            })
    }

    const filtered = useMemo(() => {
        return first.filter(item => Object.keys(filters).every(key => item[key.substring(4)].toString().includes(filters[key].toString())));
    }, [filters, first]);

    return (
        <div className={`${responsive && 'table-responsive'}`}>
            <ProviderFiltered value={{ filtered, headers, customButtons, handleChange, configToggleBtn, handleClickReset, filters, reloadBTable }}>
                <table className={`table ${className}`}>
                    {children}
                </table>
            </ProviderFiltered>
        </div>
    )
}

BTable.Head = BTHead;
BTable.Body = BTBody;
BTable.CHead = BTCHead;
BTable.CBody = BTCBody;
BTable.CButtons = BTCButtons;
BTable.CRatingBody = BTCRatingBody