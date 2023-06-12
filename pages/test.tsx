import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface Prefecture {
  prefCode: number;
  prefName: string;
}

export default function Home() {
  const [data, setData] = useState<Prefecture[]>([]);
  const [selectedPrefCodes, setSelectedPrefCodes] = useState<number[]>([]);
  const [populationData, setPopulationData] = useState<{ year: number; population: number }[] | null>(null);
  

  useEffect(() => {
    const fetchPrefectures = async () => {
      try {
        const response = await axios.get('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
          headers: {
            "X-API-KEY": "n98mT1dd9WS1Qhj7i1aMG8Aql5ScOp2IG5Y8zBn0"
          }
        });
        setData(response.data.result);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPrefectures();
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
              "X-API-KEY": "n98mT1dd9WS1Qhj7i1aMG8Aql5ScOp2IG5Y8zBn0",
            },
          }
        )
      );
  
      try {
        const responses = await Promise.all(requests);
  
        const populationData = responses.map((response, index) => {
          const year = response.data.result.boundaryYear;
          const data = response.data.result.data[0].data; // 첫 번째 18개의 요소 가져오기
  
          // populationData 배열에 연도와 해당 연도의 첫 번째 18개 요소 추가
          return { prefCode: selectedData[index].prefCode, year, data };
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
      setSelectedPrefCodes(prevSelected => [...prevSelected, prefCode]);
    } else {
      setSelectedPrefCodes(prevSelected => prevSelected.filter(code => code !== prefCode));
    }
  };

  

  return (
    <>
      <div>
        {data.map((prefecture: Prefecture) => (
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
      {populationData && (
   <LineChart width={800} height={500}  margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="year"
      label={{ value: '년도', position: 'insideBottomRight', offset: -10 }}
      tickCount={18}
      // 수정된 부분: 고정된 18개의 연도 설정
      domain={[populationData[0]?.year, populationData[0]?.year + 17]}
    />
    <YAxis label={{ value: 'year', angle: -90, position: 'Left' }} />
    <Tooltip />
    <Legend />
    {populationData.map((item, index) => {
      const lineColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      const { prefCode, data } = item;
      console.log(data)

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
)}
    </>
  );
}

