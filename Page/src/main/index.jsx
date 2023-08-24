import React, { useState, createElement } from 'react';
import { SetTitle } from './title.json';


/**
 * 
 * @param {number[]} Arr 
 * @returns 
 */
const CalcAverage = Arr => Arr.length === 0 ? 0 : Math.round(Arr.reduce((sum, i) => sum + i, 0) / Arr.length);

const GetRanking = () => {
    return fetch("./api/records")
        .then(response => response.json());
}

const IndexItem = async props => {
    SetTitle(props.match.params.language, 'index');
    const [ records, setRecords ] = useState(undefined);
    GetRanking().then(data => {
        setRecords(data);
    });
    const Data = records == null 
        ? <p>データがありません</p>
        : Object.keys(records).map(i => {
            return (
                <article className='ranking' key={i}>
                    <section>
                        <p>{records[i].name}@{i}</p>
                    </section>
                    <section>
                        <p className='score'>{CalcAverage(records[i].score)}</p>
                    </section>
                </article>
            )
        });
    return createElement(
        'div', 
        {
            align: 'center',
            className: 'container'
        },
        Data
    );
};

export default IndexItem;
