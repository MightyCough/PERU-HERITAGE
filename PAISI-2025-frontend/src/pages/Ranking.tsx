import { MainLayout } from '../components/layout'
import { LeaderBoardTable } from '../features/ranking/LeaderBoardTable'
import PodiumComponent from '../features/ranking/Podium'

export default function Ranking() {
    return (
        <MainLayout>
            <PodiumComponent />
            <LeaderBoardTable />
        </MainLayout>
    )
}
