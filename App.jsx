//1. Realizamos las siguientes importaciones
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BTable } from './components/table/TableGridC';
//Nota: necesario contar con SweetAlert, Axios, ziggy, bootstrap (cdn o instalado) !important

function App() {
     /******************************************** Configuracion Basica *************************/
    //2. Creamos el estado y pasamos un arreglo vacio.

    const [first, setFirst] = useState([]);  //Estado general de BTable
    const [isLoading, setIsLoading] = useState(true); //Controla la carga de datos
    const [catalogTipoPokemon, setCatalogTipoPokemon] = useState([]); //Controla los custom select para catalogos
     /*
    
    ------------------         -----------------
    |    Pkemones    |         |   Tipo_poke   |    
    ------------------         -----------------
    |   id   |   1   |         | id    |   1   |  
    | nombre | pepito|         | nombre|Tierra |    
    | tipo   |   1   |         |       |       |  
    |        |       |         |       |       |  
    |        |       |         |       |       |   
    |        |       |         |       |       |   
    ------------------         -----------------                      

    */

     //4. Creamo el useEffect con axios para cargar listado de datos
    useEffect(() => {
        axios.get(route('pokemones.index')) // ->name('pokemones.index')
            .then(({ data: response }) => {
                setFirst(response.pokemones); //Pasar lista de datos al state general
            })
            .catch()
        axios.get(route('tipos_pokemon.catalog'))// URL del api donde se obtienen los datos para los select custom column select
            .then(({ data: response }) => {  
                // Pasamos el catalogo al state correspondiente para generar los selects automaticos
                setCatalogTipoPokemon(response.tipos_pokemon);  
            })
            .catch()
            .finally(() => {
                setIsLoading(false); // Pasar el estado en false a isloading 
            })
    }, []);
     /************** Configuracion de los header's input y select custom ***********************************************************/
    const headers = [
        // image: "TRUE" indica que existe una columna de imagenes, urlChangeImg: "Nombre de la ruta para actualizar la imagen"
        { label: 'FOTO', labelDB: 'imageUrl', image: true, urlChangeImg: 'pokemones.updateImg' }, 
        { label: 'ID', labelDB: 'id', filter: true, type: 'number' },
        { label: 'NOMBRE', labelDB: 'nombre', filter: true, type: 'text' },
        { label: 'VIDA', labelDB: 'vida' },
        { label: 'ESTADO DEL POKEMON', labelDB: 'estado' },
        { label: 'CREADO', labelDB: 'format_date', filter: true, type: 'date' },
        { label: 'MODIFICADO', labelDB: 'updated_at', filter: true, type: 'date' },
    ];

    /*  Configuracion manual de los custom column select, cada objeto representa una opcion que sera colocada en el select
        se utilizan las mismas etiquetas de HTML pra los select "value" y "label"
    */
    const selectOpt = [
        { value: '', label: 'Selecciona un opcion' },
        { value: '1', label: 'Activo' },
        { value: '0', label: 'Inactivo' },
    ];

    /*
     Se debe realizar un map para la configuracion de los encabezados si es que se coloca el custom select,
     las variables en el map cambiaran de acuerdo al useState que se haya definido sin embargo el objeto
     que se itera dentro del map si debe llevar la sig estrucrura TP => { value: TP.[nombre del campo id en la tabla de la BD], 
                                                                           label: TP.[nombre del campo name en la tabla de la BD] }
    */
    const selectCatalogOpt = catalogTipoPokemon.map(TP => ({ value: TP.id, label: TP.name }))
    
    /*Es obligatorio colocar el elemento inical por defecto siguiendo la siguiente estructura */
    selectCatalogOpt.unshift({ value: '', label: 'Selecciona elemento' });


    /************** Finaliza configuracion de los header's input y select custom ***************************************************/
    
    /**************** Configuracion de soft delete ********************/
    const configToggleBtn = {
        toggleButton: 'pokemones.changeState', //Nombre de la ruta para actualizar el estado
        /* btn-xs, btn-sm, '', btn-lg */
        btnToggleStyle: '',
    }

    //Configuracion de reload
    //Importante
    const configReload = {
        setFirst: setFirst, //SetFirst contiene el set del estado general
        toggleIndex: 'pokemones.index',//toggleIndex: ruta por la que se obtiene la lista de datos
        nameData: 'pokemones',//nameData: nombre del arreglo que contiene los datos
    }

    // Si se desea agregar una vista de cargar a la tabla se debe agregar el siguiente bloque de codigo
    if (isLoading) {
        return (
            //Todo codigo dentro del return puede ser personalizado
            <div className="spinner-border text-info" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }

    /* Estructura completa de la tabla dentro del return,
    *  las etiquetas first,headers,configReload son requeridas */
    return (
        <div className='container'>
            <BTable responsive
            //Se agrega class name para poder colocar estilos personalizados a la tabla
                className="table-striped table-hover table-bordered text-center align-items-center align-middle mt-5"
                customButtons
                configReload={configReload}
                headers={headers}
                configToggleBtn={configToggleBtn}
                first={first}
            >
                <BTable.Head>

                    {/* TH creado por el usuario */}
                    <BTable.CHead labelDB="estado" filter="select" selectOpt={selectOpt}>
                        ESTADO
                    </BTable.CHead>
                    <BTable.CHead labelDB="fk_tipo" filter="select" selectOpt={selectCatalogOpt}>
                        ELEMENTO
                    </BTable.CHead>
                    <BTable.CHead labelDB="rating">
                        CALIFICACION
                    </BTable.CHead>

                </BTable.Head>
                <BTable.Body>

                    {/* TB creado por el usuario */}
                    <BTable.CBody labelDB="estado" selectOpt={selectOpt} />
                    <BTable.CBody labelDB="fk_tipo" selectOpt={selectCatalogOpt} urlChange="pokemones.changeType" />{/* urlChange ruta especifica para realizar el cambio */}
                    <BTable.CRatingBody labelDB="rating" sizeIcon="fa-2x"/>


                    <BTable.CButtons>

                    </BTable.CButtons>
                </BTable.Body>
            </BTable>
        </div>
    );
}

export default App;

