import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface Prefecture {
  prefCode: number;
  prefName: string;
}

const CheckboxList = () => {
  const [data, setData] = useState<Prefecture[]>([]);
  const [selectedPrefCodes, setSelectedPrefCodes] = useState<number[]>([]);
  const [populationData, setPopulationData] = useState<{
    prefCode: number;
    data: { year: number; value: number }[];
  }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
          headers: {
            'X-API-KEY': 'n98mT1dd9WS1Qhj7i1aMG8Aql5ScOp2IG5Y8zBn0',
          },
        });
        setData(response.data.result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPopulationData = async () => {
      const selectedData = data.filter((prefecture) =>
        selectedPrefCodes.includes(prefecture.prefCode)
      );
      const requests = selectedData.map((prefecture) =>
        axios.get(
          `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${prefecture.prefCode}`,
          {
            headers: {
              'X-API-KEY': 'n98mT1dd9WS1Qhj7i1aMG8Aql5ScOp2IG5Y8zBn0',
            },
          }
        )
      );

      try {
        const responses = await Promise.all(requests);

        const populationData = responses.map((response, index) => {
          const { prefCode } = selectedData[index];
          const yearData = response.data.result.data[0].data;
          return { prefCode, data: yearData };
        });
        setPopulationData(populationData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPopulationData();
  }, [selectedPrefCodes, data]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const prefCode = parseInt(event.target.value);
    if (event.target.checked) {
      setSelectedPrefCodes((prevSelected) => [...prevSelected, prefCode]);
    } else {
      setSelectedPrefCodes((prevSelected) =>
        prevSelected.filter((code) => code !== prefCode)
      );
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {data?.map((prefecture) => (
          <div key={prefecture.prefCode}>
            <label>
              <input
                type="checkbox"
                value={prefecture.prefCode}
                checked={selectedPrefCodes.includes(prefecture.prefCode)}
                onChange={handleCheckboxChange}
              />
              {prefecture.prefName}
            </label>
          </div>
        ))}
      </div>
      {populationData.length > 0 && (
        <div style={{ width: '800px' }}>
          <LineChart width={800} height={500} margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: '년도', position: 'insideBottomRight', offset: -10 }}
              tickCount={1}
              domain={[1960, 2045]}
            /> <YAxis label={{ angle: 0, position: 'up' }} />
            <Tooltip />
            <Legend />
            {populationData.map((item, index) => {
              const lineColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
              const { prefCode, data } = item;

              if (data) {
                return (
                  <Line
                    key={prefCode}
                    type="monotone"
                    data={data}
                    dataKey="value"
                    name={`PrefCode: ${prefCode}`}
                    stroke={lineColor}
                    activeDot={{ r: 8 }}
                    dot={false}
                  />
                );
              }

              return null;
            })}
          </LineChart>
        </div>
      )}
    </>
  );
};

export default CheckboxList;