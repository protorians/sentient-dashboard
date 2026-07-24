import {UserActivitiesFeed} from "@/modules/dashboard/presentation/components/user-activities-feed";

export function UsersSidePanel() {
    return (
        <div className="w-full lg:max-w-[25dvw] ">
            <div className="flex flex-col gap-4">
                <div className="">
                    <UserActivitiesFeed compacted={false}/>
                </div>
                <div className="sticky top-20 ">

                </div>
            </div>
        </div>
    )
}
