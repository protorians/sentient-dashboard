import {UserActivitiesFeed} from "@/modules/dashboard/presentation/components/user-activities-feed";
import {DashboardModulesStats} from "@/modules/dashboard/presentation/components/dashboard-modules-stats";

function DashboardSidePanel() {
    return (
        <div className="w-full lg:max-w-[25dvw] ">
            <div className="flex flex-col gap-4">
                <div className="">
                    <UserActivitiesFeed/>
                </div>
                <div className="sticky top-20 ">
                    <DashboardModulesStats/>
                </div>
            </div>
        </div>
    )
}

export default DashboardSidePanel